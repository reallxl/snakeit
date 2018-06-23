import * as EN_ from '../../include/Enums'

import { appDataManager } from '../../main'
import { appEventBus } from '../../main'

//------------------------------------------------------------------------------------------
//  NormalActionSet
//------------------------------------------------------------------------------------------
export function NormalActionSet(body) {
  this.body = body;
}
//------------------------------------------------------------------------------------------
//  applyEffect
//------------------------------------------------------------------------------------------
NormalActionSet.prototype.applyEffect = function() {
  //--- dummy
}
//------------------------------------------------------------------------------------------
//  handleMovCtrl
//------------------------------------------------------------------------------------------
NormalActionSet.prototype.handleMovCtrl = function(dir) {
  if (this.body.dataList.length == 1) {
    console.log(this.body.trailingDataList.length);
  }
  if ((this.body.dataList.length == 1 && dir != appDataManager.getMovingDir(this.body.dataList[0].pos, this.body.trailingDataList[0].pos)) ||
    (this.body.dataList.length > 1 && dir != appDataManager.getMovingDir(this.body.dataList[0].pos, this.body.dataList[1].pos))) {
    this.body.curMovingDir = dir;
  }
}
//------------------------------------------------------------------------------------------
//  handleActCtrl
//------------------------------------------------------------------------------------------
NormalActionSet.prototype.handleActCtrl = function(key) {
  //--- dummy
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

  return nextHeadPos;
}
//------------------------------------------------------------------------------------------
//  isColliding
//------------------------------------------------------------------------------------------
NormalActionSet.prototype.isColliding = function(nextHeadPos) {
  let ret = false;

  if (this.body.dataList.find((bodyNode) => {
    return bodyNode.pos == nextHeadPos;
  })) {
    //--- colliding (i.e. GAME OVER)
    ret = true;
  }
  /*if (nextHeadPos == snakeData.curTailPos && snakeData.curLength == snakeData.length) {
    newData = Object.assign({}, this.dataMap[snakeData.curHeadPos]);

    newData.toDirCode = undefined;

    snakeData.curHeadPos = nextHeadPos;
    snakeData.curTailPos = this.getNextPos(snakeData.curTailPos);
    this.dataMap.splice(snakeData.curHeadPos, 1, newData);
    break;
  }*/

  return ret;
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
//  shouldUpdateTailPos
//------------------------------------------------------------------------------------------
NormalActionSet.prototype.shouldUpdateTailPos = function() {
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
//------------------------------------------------------------------------------------------
//  applyPostEffect
//------------------------------------------------------------------------------------------
NormalActionSet.prototype.applyPostEffect = function() {
  //--- dummy
}
