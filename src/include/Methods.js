import * as EN_ from './Enums'

export function reverseDir(dir) {
  return (EN_.KEY._LEFT + (((dir - EN_.KEY._LEFT) + 2) % 4));
}

export function shuffleArr(arr) {
  for (let i = (arr.length - 1); i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}
