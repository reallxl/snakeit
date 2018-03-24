import { _KEY } from './Enums';

export function getRandomAvailablePos(mapSize, map) {
  var pos;

  do {
    pos = Math.floor(Math.random() * ((mapSize.width * mapSize.height - 1) + 1));
  } while (map[pos] != null);

  return pos;
}

export function getNextPos(mapSize, curPos, dir, repeatTime = 1, isContinuous = true) {
  var nextPos = curPos;

  do {
    switch (dir) {
      case _KEY._LEFT: {
        nextPos -= 1;
        if (isContinuous && (curPos % mapSize.width) == 0) {
          nextPos += mapSize.width;
        }
        break;
      }
      case _KEY._UP: {
        nextPos -= mapSize.width;
        if (isContinuous && nextPos < 0) {
          nextPos += (mapSize.width * mapSize.height);
        }
        break;
      }
      case _KEY._RIGHT: {
        nextPos += 1;
        if (isContinuous && (curPos % mapSize.width) == (mapSize.width - 1)) {
          nextPos -= mapSize.width;
        }
        break;
      }
      case _KEY._DOWN: {
        nextPos += mapSize.width;
        if (isContinuous && nextPos >= (mapSize.width * mapSize.height)) {
          nextPos -= (mapSize.width * mapSize.height);
        }
        break;
      }
    }
  } while (--repeatTime);

  return nextPos;
}

export function getMovingDir(mapSize, fromPos, toPos) {
  var ret = undefined;

  switch (toPos - fromPos) {
    case -1:
    case (mapSize.width - 1):
      ret = _KEY._LEFT;
      break;

    case -mapSize.width:
    case ((mapSize.height - 1) * mapSize.width):
      ret = _KEY._UP;
      break;
    case 1:
    case -(mapSize.width - 1):
      ret = _KEY._RIGHT;
      break;
    case mapSize.width:
    case -((mapSize.height - 1) * mapSize.width):
      ret = _KEY._DOWN;
      break;
  }

  return ret;
}

export function reverseDir(dir) {
  return ((dir + 2) % 4);
}

export function shuffleArr(arr) {
  for (let i = (arr.length - 1); i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export function DBGPOS(mapSize, pos) {
  return [(pos % mapSize.width), Math.floor(pos / mapSize.width)];
}
