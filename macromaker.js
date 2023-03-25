
// const runMacroEndpointUrl = 'https://api-dot-macromaker.googleplex.com/construct-prompt';
const runMacroEndpointUrl = 'https://api-dot-macromaker.googleplex.com/run-macro';

export async function extractEntities(groundingText, entityCount = 5) {
  const MACRO_ID = 'YHCJg2s4VSpmwQ46tvAP';
  const userInputs = {
    "2": groundingText, // [[text]]
    "4": String(entityCount), // [[count]]
  }

  const formData = new FormData();
  formData.append('id', MACRO_ID);
  formData.append('userInputs', JSON.stringify(userInputs));
  formData.append('temperature', 0.1);
  // formData.append('model_id', 'sax_llmau_flan_ulm_24b');
  formData.append('model_id', 'sax_llmau_flan_ulm_340b');

  const res = await fetch(runMacroEndpointUrl, {
    credentials: 'include',
    method: 'POST',
    body: formData
  });

  const json = await res.json();

  const message = json.messages[0].text;
  const score = json.scores[0];

  // Cleanup messages, which are newline separated, and sometimes include a
  // leading dash.
  const entitySplit = message.split('\n');
  const entities = entitySplit.map(rawEntity => cleanEntity(rawEntity));

  console.log(entities);
  if (entities.length !== entityCount) {
    console.warn(`Got ${entities.length} entities, but expected ${entityCount}.`)
  }
  return entities;
}

function cleanEntity(entity) {
  let out = entity;
  if (entity.startsWith('-')) {
    out = entity.substring(1);
  }
  return out.trim();
}

export async function isCausalLink(groundingText, entity1, entity2) {
  const MACRO_ID = "ZgeYc8ORsdyF7x3Sbo7u";
  const userInputs = {
    "6": groundingText, // [[text]]
    "2": entity1, // [[X]]
    "4": entity2, // [[Y]]
  }

  const formData = new FormData();
  formData.append('id', MACRO_ID);
  formData.append('userInputs', JSON.stringify(userInputs));
  formData.append('temperature', 0.3);
  formData.append('model_id', 'sax_llmau_flan_ulm_24b');
  // formData.append('model_id', 'sax_llmau_flan_ulm_340b');

  const res = await fetch(runMacroEndpointUrl, {
    credentials: 'include',
    method: 'POST',
    body: formData
  });

  const json = await res.json();

  const message = json.messages[0].text.toLowerCase();
  const texts = json.messages.map(m => m.text);
  const scores = json.scores;
  console.log(texts, scores);


  const messageBoolean = JSON.parse(message);
  if (messageBoolean) {
    console.log(`${entity1} --> ${entity2}`);
  } else {
    console.log(`No link between ${entity1} and ${entity2}.`);
  }
  return messageBoolean;
}