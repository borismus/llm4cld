import {GROUNDING, INTERESTING_ENTITIES} from './constants.js';
import {extractEntities} from './openai.js';
import {OPENAI_KEY} from './secret.js';
import {TextAnalyser} from './text-analyser.js';
import {updateURL, getParamsFromURL, stringToList, listToString} from './url.js';

const openAiKeyEl = document.querySelector('#openai-key');
const systemDescriptionEl = document.querySelector('#system-description');
const entitiesEl = document.querySelector('#entity-list');
const cgmlEl = document.querySelector('#cgml');
const graphEl = document.querySelector('causal-graph');
const statusEl = document.querySelector('#status');

export function initializeUI() {
  openAiKeyEl.value = OPENAI_KEY;

  // Populate input boxes with values from GET params.
  const params = getParamsFromURL();
  for (const key in params) {
    const value = params[key];
    switch (key) {
      case 'desc':
        updateDescription(value);
        break;
      case 'ents':
        updateEntities(stringToList(value));
        break;
      case 'cgml':
        updateCGML(value);
        break;
      default:
        console.error(`Unknown param: ${key}.`);
    }
  }
  if (!params.ents) {
    updateEntities(INTERESTING_ENTITIES);
  }
  if (!params.desc) {
    updateDescription(GROUNDING);
  }

  // Update URL in response to user-initiated changes to textboxes.
  systemDescriptionEl.addEventListener('input', () => updateURL({
    desc: systemDescriptionEl.innerText
  }));
  entitiesEl.addEventListener('input', () => {
    updateURL({
      ents: entitiesEl.innerText.replaceAll('\n', ';')
    })
  });
  cgmlEl.addEventListener('input', () => {
    renderGraph();
    updateURL({
      cgml: cgmlEl.innerText
    })
  });
}

function setContentEditableLoading(contentEditableEl, isLoading) {
  if (isLoading) {
    contentEditableEl.classList.add('anim-border');
  } else {
    contentEditableEl.classList.remove('anim-border');
  }
  contentEditableEl.setAttribute('contenteditable', !isLoading);
}

export function updateDescription(description) {
  systemDescriptionEl.innerText = description;
}

export function updateEntities(entityList) {
  entitiesEl.innerText = '';
  for (const entity of entityList) {
    entitiesEl.innerText += entity + '\n';
  }
  // Ensure that we don't have trailing newlines.
  entitiesEl.innerText = entitiesEl.innerText.trim();

  // Update URL in response to programatic updates of entities.
  updateURL({ents: entitiesEl.innerText.replaceAll('\n', ';')});
}

function createCGML(links, edgeLabels = true) {
  let cgml = '';
  for (const {from, to, isOpposite, explanation} of links) {
    const arrow = isOpposite ? 'o->' : '-->';
    const relation = `${from} ${arrow} ${to}`;

    if (explanation) {
      if (edgeLabels) {
        cgml += `${relation} // ${splitAboutEveryNCharsPreservingWords(explanation, 20)}\n`;
      } else {
        cgml += `// ${explanation}\n${relation}\n`;
      }
    } else {
      cgml += relation + '\n';
    }
    // Add a newline for readability if we've included an explanation.
    if (explanation) {
      cgml += '\n'
    }
  }
  return cgml;
}

export function updateCGML(cgml) {
  if (!cgml) {
    graphEl.cgml = '';
  }
  cgmlEl.innerText = cgml;

  // Re-render the graph using CGML.js.
  graphEl.cgml = cgml;

  // Update URL responding to CGML updates.
  updateURL({cgml: cgmlEl.innerText});
}



// DOM Event handlers.
window.extractEntities = async () => {
  console.log('extractEntities');
  const entityCount = 5;
  updateStatus(`Extracting ${entityCount} entities...`);

  setContentEditableLoading(entitiesEl, true);
  updateCGML('');
  updateEntities([]);
  const entities = await extractEntities(systemDescriptionEl.innerText, entityCount);
  updateEntities(entities);
  setContentEditableLoading(entitiesEl, false);
  updateStatus('');
  analyser = null;
};

let analyser = null;
async function evaluateLinks() {
  console.log('evaluateLinks');
  const entities = entitiesEl.innerText.trim().split('\n');
  analyser = new TextAnalyser(systemDescriptionEl.innerText);

  updateCGML('');
  setContentEditableLoading(cgmlEl, true);
  const links = await analyser.evaluateCausalLinksBetweenEntities(entities, {
    linksCallback: (links) => {
      const cgml = createCGML(links);
      updateCGML(cgml);
    }
  });
  setContentEditableLoading(cgmlEl, false);
  updateStatus('');
}

function pauseEvaluatingLinks() {
  analyser.cancel();
  analyser = null;
}

function updateStatusBriefly(text, durationSeconds = 3) {
  updateStatus(text);
  setTimeout(() => {
    updateStatus('');
  }, durationSeconds * 1000);
}

function splitAboutEveryNCharsPreservingWords(text, maxCharsPerLine = 40) {
  const words = text.split(' ');
  const lines = [];
  let charCount = 0;
  let line = '';
  for (const word of words) {
    if (charCount > maxCharsPerLine) {
      lines.push(line);
      line = '';
      charCount = 0;
    }
    line += word + ' ';
    charCount += word.length + 1;
  }
  lines.push(line);
  // return text;
  return lines.join('\\n');
}

window.toggleEvaluateLinks = async (buttonEl) => {
  const isEvaluatingLinks = (analyser !== null);
  if (isEvaluatingLinks) {
    pauseEvaluatingLinks();
    buttonEl.classList.remove('running');
  } else {
    buttonEl.classList.add('running');
    await evaluateLinks();
    buttonEl.classList.remove('running');
  }
}

window.renderGraph = () => {
  console.log('renderGraph');
  graphEl.cgml = cgmlEl.innerText;
}

window.copyURL = () => {
  let url = document.location.href;

  navigator.clipboard.writeText(url).then(() => {
    updateStatusBriefly('Copied link!');
  }, function () {
    updateStatusBriefly('Copy error.');
  });
}

window.updateStatus = (text) => {
  statusEl.innerText = text;
}