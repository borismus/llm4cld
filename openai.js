const ENDPOINT_URL = 'https://us-central1-musemuse.cloudfunctions.net/openai_complete';
// const ENDPOINT_URL = 'http://localhost:8080';

export async function extractEntities(groundingText, entityCount = 5) {
}

export async function callGPT4(prompt) {
  const formData = new FormData();
  const res = await fetch(ENDPOINT_URL + '?' + new URLSearchParams({
    'openai_key': 'value',
    bar: 2,
}));

  console.log(res);
}