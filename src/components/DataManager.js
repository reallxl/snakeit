import * as EN_ from '../include/Enums'

export function DataManager() {
  this.mapSize = undefined;
  this.snakeList = undefined;
  this.preyList = undefined;
}

//------------------------------------------------------------------------------------------
//  init
//------------------------------------------------------------------------------------------
DataManager.prototype.init = function(mapSize, snakeList, preyList) {
  this.mapSize = mapSize;
  this.snakeList = snakeList;
  this.preyList = preyList;
}
//------------------------------------------------------------------------------------------
//  reset
//------------------------------------------------------------------------------------------
DataManager.prototype.reset = function() {
  this.mapSize = undefined;
  this.snakeList = undefined;
  this.preyList = undefined;
}
//------------------------------------------------------------------------------------------
//  getNextPos
//------------------------------------------------------------------------------------------
DataManager.prototype.getNextPos = function(curPos, dir, repeatTime = 1, isInfinite = true) {
  var nextPos = curPos;

  do {
    switch (dir) {
      case EN_.KEY._LEFT: {
        nextPos -= 1;
        if (isInfinite && (curPos % this.mapSize.width) == 0) {
          nextPos += this.mapSize.width;
        }
        break;
      }
      case EN_.KEY._UP: {
        nextPos -= this.mapSize.width;
        if (isInfinite && nextPos < 0) {
          nextPos += (this.mapSize.width * this.mapSize.height);
        }
        break;
      }
      case EN_.KEY._RIGHT: {
        nextPos += 1;
        if (isInfinite && (curPos % this.mapSize.width) == (this.mapSize.width - 1)) {
          nextPos -= this.mapSize.width;
        }
        break;
      }
      case EN_.KEY._DOWN: {
        nextPos += this.mapSize.width;
        if (isInfinite && nextPos >= (this.mapSize.width * this.mapSize.height)) {
          nextPos -= (this.mapSize.width * this.mapSize.height);
        }
        break;
      }
    }
  } while (--repeatTime);

  return nextPos;
}
//------------------------------------------------------------------------------------------
//  getMovingDir
//------------------------------------------------------------------------------------------
DataManager.prototype.getMovingDir = function(fromPos, toPos) {
  var ret = undefined;

  switch (toPos - fromPos) {
    case -1:
    case (this.mapSize.width - 1):
      ret = EN_.KEY._LEFT;
      break;

    case -this.mapSize.width:
    case ((this.mapSize.height - 1) * this.mapSize.width):
      ret = EN_.KEY._UP;
      break;
    case 1:
    case -(this.mapSize.width - 1):
      ret = EN_.KEY._RIGHT;
      break;
    case this.mapSize.width:
    case -((this.mapSize.height - 1) * this.mapSize.width):
      ret = EN_.KEY._DOWN;
      break;
  }

  return ret;
}
//------------------------------------------------------------------------------------------
//  getRandomAvailablePos
//------------------------------------------------------------------------------------------
DataManager.prototype.getRandomAvailablePos = function() {
  var pos;

  do {
    pos = Math.floor(Math.random() * ((this.mapSize.width * this.mapSize.height - 1) + 1));
  } while (this.snakeList.find(snake => snake.body.dataList.find(node => node.pos == pos)) ||
    this.preyList.find(prey => prey.pos == pos));

  return pos;
}
