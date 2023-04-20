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
  systemDescriptionEl.innerText = GROUNDING;
  updateEntities(INTERESTING_ENTITIES);

  cgmlEl.addEventListener('input', renderGraph);
}

function setContentEditableLoading(contentEditableEl, isLoading) {
  if (isLoading) {
    contentEditableEl.classList.add('anim-border');
  } else {
    contentEditableEl.classList.remove('anim-border');
  }
  contentEditableEl.setAttribute('contenteditable', !isLoading);
}

function updateEntities(entityList) {
  entitiesEl.innerText = '';
  for (const entity of entityList) {
    entitiesEl.innerText += entity + '\n';
  }
  // Ensure that we don't have trailing newlines.
  entitiesEl.innerText = entitiesEl.innerText.trim();
}

function createCGML(links) {
  let cgml = '';
  for (const {from, to, isOpposite, explanation} of links) {
    const arrow = isOpposite ? 'o->' : '-->';
    const relation = `${from} ${arrow} ${to}\n`;
    if (explanation) {
      cgml += `// ${explanation}\n`;
    }
    cgml += relation;
    // Add a newline for readability if we've included an explanation.
    if (explanation) {
      cgml += '\n'
    }
  }
  return cgml;
}

function updateCGML(cgml) {
  if (!cgml) {
    graphEl.cgml = '';
  }
  cgmlEl.innerText = cgml;

  // Re-render the graph using CGML.js.
  graphEl.cgml = cgml;
}



// DOM Event handlers.
window.extractEntities = async () => {
  console.log('extractEntities');

  setContentEditableLoading(entitiesEl, true);
  const entities = await extractEntities(systemDescriptionEl.innerText, 8);
  updateEntities(entities);
  setContentEditableLoading(entitiesEl, false);
};

let analyser = null;
async function evaluateLinks() {
  console.log('evaluateLinks');
  const entities = entitiesEl.innerText.trim().split('\n');
  analyser = new TextAnalyser(systemDescriptionEl.innerText);

  setContentEditableLoading(cgmlEl, true);
  const links = await analyser.evaluateCausalLinksBetweenEntities(entities, {
    linksCallback: (links) => {
      const cgml = createCGML(links);
      updateCGML(cgml);
    }
  });
  setContentEditableLoading(cgmlEl, false);
}

function pauseEvaluatingLinks() {
  analyser.cancel();
  analyser = null;
}

window.toggleEvaluateLinks = (buttonEl) => {
  const isEvaluatingLinks = (analyser !== null);
  if (isEvaluatingLinks) {
    pauseEvaluatingLinks();
  } else {
    evaluateLinks();
  }
}

window.renderGraph = async () => {
  console.log('renderGraph');
  graphEl.cgml = cgmlEl.innerText;
}
