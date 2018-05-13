import * as EN_ from '../../include/Enums'
import * as PA_ from '../../include/Params'

import { DataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'
import { ReversedActionSet } from './ReversedActionSet'

export function Snake({
  length = PA_.INIT_BODY_LENGTH,
  dataList = [],
  curMovingDir = EN_.KEY._RIGHT,
  trailingLength = PA_.INIT_TRAILING_LENGTH,
  trailingDataList = [],
  effect = EN_.EFFECT._NORMAL,
} = {}) {
  this.body = {
    length: length,
    dataList: dataList,
    curMovingDir: curMovingDir,
    trailingLength: trailingLength,
    trailingDataList: trailingDataList,
  };
  this.actionSet = null;

  this.refreshBodyEffect(effect);
}

//------------------------------------------------------------------------------------------
//  refreshBodyEffect
//------------------------------------------------------------------------------------------
Snake.prototype.refreshBodyEffect = function(effect) {
  //--- update action set based on prey effect
  switch (effect) {
    case EN_.EFFECT._REVERSED:
      this.actionSet = new ReversedActionSet(this.body);
      break;
    default:
      this.actionSet = new NormalActionSet(this.body);
      break;
  }
};

//------------------------------------------------------------------------------------------
//  updateMovingDir
//------------------------------------------------------------------------------------------
Snake.prototype.updateMovingDir = function(dir) {
  if ((this.body.dataList.length == 1 && dir != DataManager.getMovingDir(this.body.dataList[0].pos, this.trailingData[0].pos)) ||
    (this.body.dataList.length > 1 && dir != DataManager.getMovingDir(this.body.dataList[0].pos, this.body.dataList[1].pos))) {
    this.body.curMovingDir = dir;
  }
};
//------------------------------------------------------------------------------------------
//  getNextHeadPos
//------------------------------------------------------------------------------------------
Snake.prototype.getNextHeadPos = function() {
  return this.actionSet.getNextHeadPos();
};
//------------------------------------------------------------------------------------------
//  updateHeadPos
//------------------------------------------------------------------------------------------
Snake.prototype.updateHeadPos = function(nextHeadPos) {
  return this.actionSet.updateHeadPos(nextHeadPos);
};
//------------------------------------------------------------------------------------------
//  grow
//------------------------------------------------------------------------------------------
Snake.prototype.grow = function(effect) {
  this.body.length++;

  //--- update action set based on prey effect
  this.refreshBodyEffect(effect);
};
//------------------------------------------------------------------------------------------
//  doUpdateTailPos
//------------------------------------------------------------------------------------------
Snake.prototype.doUpdateTailPos = function() {
  return this.actionSet.doUpdateTailPos();
},
//------------------------------------------------------------------------------------------
//  updateTailPos
//------------------------------------------------------------------------------------------
Snake.prototype.updateTailPos = function() {
  return this.actionSet.updateTailPos();
};
//------------------------------------------------------------------------------------------
//  updateTrailingData
//------------------------------------------------------------------------------------------
Snake.prototype.updateTrailingData = function(lastTailData) {
  return this.actionSet.updateTrailingData(lastTailData);
};
//------------------------------------------------------------------------------------------
//  hasPostEffect
//------------------------------------------------------------------------------------------
Snake.prototype.hasPostEffect = function() {
  return false;
}
