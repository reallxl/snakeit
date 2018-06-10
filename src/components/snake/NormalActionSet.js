import * as EN_ from '../../include/Enums'

import { appDataManager } from '../../main'
import { appEventBus } from '../../main'

export function NormalActionSet(body) {
  this.body = body;
}

//------------------------------------------------------------------------------------------
//  getNextHeadPos
//------------------------------------------------------------------------------------------
NormalActionSet.prototype.getNextHeadPos = function() {
  let nextHeadPos;
  if (this.body.dataList.length) {
    nextHeadPos = appDataManager.getNextPos(this.body.dataList[0].pos, this.body.curMovingDir);
  } else {
    //--- default
    nextHeadPos = 0;
  }

  //--- colliding (i.e. GAME OVER)
  if (this.body.dataList.find((bodyNode) => {
    return bodyNode.pos == nextHeadPos;
  })) {
    return appEventBus.$emit('gameOver', {
      pos: nextHeadPos,
    });
  }
  /*if (nextHeadPos == snakeData.curTailPos && snakeData.curLength == snakeData.length) {
    newData = Object.assign({}, this.dataMap[snakeData.curHeadPos]);

    newData.toDirCode = undefined;

    snakeData.curHeadPos = nextHeadPos;
    snakeData.curTailPos = this.getNextPos(snakeData.curTailPos);
    this.dataMap.splice(snakeData.curHeadPos, 1, newData);
    break;
  }*/

  return nextHeadPos;
}
//------------------------------------------------------------------------------------------
//  updateHeadPos
//------------------------------------------------------------------------------------------
NormalActionSet.prototype.updateHeadPos = function(nextHeadPos) {
  //--- update current head position into bodyData
  this.body.dataList.unshift({
    pos: nextHeadPos,
  });
}
//------------------------------------------------------------------------------------------
//  doUpdateTailPos
//------------------------------------------------------------------------------------------
NormalActionSet.prototype.doUpdateTailPos = function() {
  return this.body.dataList.length > this.body.length;
}
//------------------------------------------------------------------------------------------
//  updateTailPos
//------------------------------------------------------------------------------------------
NormalActionSet.prototype.updateTailPos = function() {
  return this.body.dataList.pop();
}
//------------------------------------------------------------------------------------------
//  updateTrailingData
//------------------------------------------------------------------------------------------
NormalActionSet.prototype.updateTrailingData = function(lastTailData) {
  //--- add new
  this.body.trailingDataList.unshift(lastTailData);

  //--- remove old
  if (this.body.trailingDataList.length > this.body.trailingLength) {
    this.body.trailingDataList.pop();
  }
}
