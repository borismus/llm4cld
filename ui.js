import {GROUNDING, INTERESTING_ENTITIES} from './constants.js';
import {extractEntities} from './openai.js';
import {OPENAI_KEY} from './secret.js';
import {TextAnalyser} from './text-analyser.js';

const openAiKeyEl = document.querySelector('#openai-key');
const systemDescriptionEl = document.querySelector('#system-description');
const entitiesEl = document.querySelector('#entity-list');
const cgmlEl = document.querySelector('#cgml');
const graphEl = document.querySelector('causal-graph');

export function initializeUI() {
  openAiKeyEl.value = OPENAI_KEY;
  systemDescriptionEl.value = GROUNDING;
  updateEntities(INTERESTING_ENTITIES);

  for (const textareaEl of [systemDescriptionEl, entitiesEl]) {
    textareaEl.addEventListener('input', e => updateTextareaHeight(e.target));
  }
  updateAllTextareaHeights();

  cgmlEl.addEventListener('input', renderGraph);
}

function updateAllTextareaHeights() {
  for (const textareaEl of [systemDescriptionEl, entitiesEl]) {
    updateTextareaHeight(textareaEl);
  }
}

function updateTextareaHeight(textareaEl) {
  textareaEl.style.height = textareaEl.scrollHeight + 'px';
}

function updateEntities(entityList) {
  entitiesEl.value = '';
  for (const entity of entityList) {
    entitiesEl.value += entity + '\n';
  }
  updateTextareaHeight(entitiesEl);
}

function createCGML(links) {
  let cgml = '';
  for (const {from, to, isOpposite} of links) {
    const arrow = isOpposite ? 'o->' : '-->';
    cgml += `${from} ${arrow} ${to}\n`;
  }
  return cgml;
}

function updateCGML(cgml) {
  if (!cgml) {
    graphEl.cgml = '';
  }
  cgmlEl.value = cgml;
  updateTextareaHeight(cgmlEl);

  // Re-render the graph using CGML.js.
  graphEl.cgml = cgml;
}



window.addEventListener('resize', updateAllTextareaHeights);

// DOM Event handlers.
window.extractEntities = async () => {
  console.log('extractEntities');
  const entities = await extractEntities(GROUNDING, 8);
  updateEntities(entities);
};

window.evaluateLinks = async () => {
  console.log('evaluateLinks');
  const entities = entitiesEl.value.trim().split('\n');
  const analyser = new TextAnalyser(GROUNDING);
  const links = await analyser.evaluateCausalLinksBetweenEntities(entities, {
    linksCallback: (links) => {
      const cgml = createCGML(links);
      updateCGML(cgml);
    }
  });
}

window.renderGraph = async () => {
  console.log('renderGraph');
  graphEl.cgml = cgmlEl.value;
}
