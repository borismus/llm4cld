const ENDPOINT_URL = 'https://us-central1-musemuse.cloudfunctions.net/openai_complete';
import {DEFAULT_TEMPERATURE} from './constants.js';
// const ENDPOINT_URL = 'http://localhost:8080';
import {OPENAI_KEY} from './secret.js';

export async function extractEntities(groundingText, entityCount = 5) {
  const prompt = generateExtractEntitiesPrompt(groundingText, entityCount);
  const gptRes = await callGPT4(prompt);
  // Parse response into a list.
  let entities = gptRes.split('\n');
  entities = entities.map(ent => cleanupEntity(ent));
  return entities;
}

export async function isCausalLink(groundingText, entity1, entity2, {isOpposite = false} = {}) {
  const prompt = isOpposite ?
    generateCausalNegativeLinkPrompt(groundingText, entity1, entity2) :
    generateCausalLinkPrompt(groundingText, entity1, entity2);

  const gptRes = await callGPT4(prompt);
  const lowerGptRes = gptRes.toLowerCase();

  // Parse response into a boolean.
  let res = null;
  switch (lowerGptRes) {
    case 'true':
      res = true;
      break;
    case 'false':
      res = false;
      break;
    default:
      throw new Error(`Could not parse response into boolean: "${gptRes}"`);
  }
  if (res) {
    console.log(`isCausalLink${isOpposite ? ' (opposite)' : ''}: ${entity1} --> ${entity2}`);
  }
  return res;
}

export async function explainCausalLink(groundingText, entity1, entity2, {isOpposite = false} = {}) {
  const prompt = generateExplainLinkPrompt(groundingText, entity1, entity2, isOpposite);
  const gptRes = await callGPT4(prompt);
  return gptRes;
}

export async function callGPT4(prompt, {verbose = true} = {}) {
  if (!prompt) {
    throw new Error(`Prompt required.`);
  }
  const request = {
    openai_key: OPENAI_KEY,
    model: 'gpt-4',
    temperature: DEFAULT_TEMPERATURE,
    prompt,
  };
  if (verbose) {
    console.log(`[GPT] Request prompt "${prompt}"`);
  }
  const start = performance.now();
  const res = await fetch(ENDPOINT_URL + '?' + new URLSearchParams(request));
  const duration = performance.now() - start;

  const text = await res.text();
  if (verbose) {
    console.log(`[GPT] Response text "${text}"`);
  } else {
    console.log(`[GPT] Response: ${text.length} chars. Took ${Math.floor(duration)} ms.`);
  }

  return text;
}

function generateExtractEntitiesPrompt(groundingText, entityCount) {
  return `Text: ${groundingText}

The following ${entityCount} entities appear in the text above:
-`;
}

function generateCausalLinkPrompt(groundingText, entity1, entity2) {
  return `Text: ${groundingText}

The text above suggests that more ${entity1} causes more ${entity2}. Answer one of "true" or "false".`;
}

function generateCausalNegativeLinkPrompt(groundingText, entity1, entity2) {
  return `Text: ${groundingText}

The text above suggests that more ${entity1} causes less ${entity2}. Answer one of "true" or "false".`;
}


function generateExplainLinkPrompt(groundingText, entity1, entity2, isOpposite) {
  const adverb = isOpposite ? 'less' : 'more';
  return `Text: ${groundingText}

The text above suggests that more ${entity1} causes ${adverb} ${entity2}. In one short sentence, explain why.`;
}

function cleanupEntity(ent) {
  console.info('cleanupEntity', ent);
  // Usually in the form of a bulleted or numbered list, eg ("30. Foo" or "- Bar").

  // First check for bullets.
  if (ent.startsWith('- ')) {
    return ent.substring(2);
  }
  // Might also be numbered.
  const match = ent.match(/^[0-9]+\. (.*)$/);
  if (match !== null) {
    return match[1];
  }
  // If there no prefix, and it starts with a capital, let it through.
  if (ent.match(/^[A-Z].*$/)) {
    return ent;
  }
  throw new Error(`Entity not in recognized format: "${ent}"`)
}