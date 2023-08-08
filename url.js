

export function updateURL(keyValue) {
  const newParams = new URLSearchParams(keyValue);
  const oldParams = new URLSearchParams(location.search);
  const usp = new URLSearchParams({
    ...Object.fromEntries(oldParams),
    ...Object.fromEntries(newParams),
  });
  history.replaceState(keyValue, '', '?' + usp.toString());
}

export function getParamsFromURL() {
  const out = {

  }
  const searchParams = new URLSearchParams(location.search);
  for (const [key, value] of searchParams.entries()) {
    out[key] = value;
  }

  return out;
}

export function listToString(list) {
  return list.join(';');
}

export function stringToList(str) {
  return str.split(';');
}