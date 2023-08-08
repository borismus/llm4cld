import {CausalGraphElement} from './deps/causal-graph-tools/causal-graph-element.js';

// import {extractEntities, isCausalLink} from './macromaker.js';
import {callGPT4, extractEntities, isCausalLink} from './openai.js';
import {initializeUI} from './ui.js';


async function main() {

  let sgml = '';
  // isCausalLink(GROUNDING, 'more chickens', 'more pain');
  // isCausalLink(GROUNDING, 'more knights', 'fewer oxen');
  // isCausalLink(GROUNDING, 'heavier armor', 'stronger horses');
  // const entities = await extractEntities(GROUNDING, 4);
  // const links = await evaluateCausalLinksBetweenEntities(entities);
  // const links = await evaluateCausalLinksBetweenEntities(INTERESTING_ENTITIES);

  initializeUI();

  // const test = callGPT4('hello');
}

window.addEventListener('DOMContentLoaded', main);
