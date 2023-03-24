// const ENDPOINT_URL = 'https://us-central1-musemuse.cloudfunctions.net/openai_complete';
const ENDPOINT_URL = 'http://localhost:8080';
import {OPENAI_KEY} from './secret.js';

export async function extractEntities(groundingText, entityCount = 5) {
}

export async function callGPT4(prompt) {
  const formData = new FormData();
  const res = await fetch(ENDPOINT_URL + '?' + new URLSearchParams({
    openai_key: OPENAI_KEY,
    model: 'gpt-4',
    temperature: 0.3,
    prompt,
  }));

  console.log(res);
}