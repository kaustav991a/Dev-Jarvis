let history = [];

export function addMemory(entry) {
  history.push(entry);

  if (history.length > 10) {
    history.shift(); // keep only last 10 items
  }
}

export function getMemory() {
  return history;
}

export function clearMemory() {
  history = [];
}
