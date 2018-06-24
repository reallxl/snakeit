import * as EN_ from '../../include/Enums'

import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

//------------------------------------------------------------------------------------------
//  CirculatedActionSet
//------------------------------------------------------------------------------------------
export function CirculatedActionSet(body) {
  NormalActionSet.call(this, body);

  this.curDegree = 0;
}
CirculatedActionSet.prototype = Object.create(NormalActionSet.prototype);
//------------------------------------------------------------------------------------------
//  applyEffect
//------------------------------------------------------------------------------------------
CirculatedActionSet.prototype.applyEffect = function(onGrowing) {
  NormalActionSet.prototype.applyEffect.call(this, onGrowing);

  this.curDegree = (this.curDegree + 45) % 360;
}
//------------------------------------------------------------------------------------------
//  handleMovCtrl
//------------------------------------------------------------------------------------------
CirculatedActionSet.prototype.handleMovCtrl = function(dir) {
  //--- do nothing
}
//------------------------------------------------------------------------------------------
//  handleActCtrl
//------------------------------------------------------------------------------------------
CirculatedActionSet.prototype.handleActCtrl = function(key) {
  switch (key) {
    case EN_.KEY._BTN_A:
      this.curDegree = (this.curDegree + 45) % 360;
      break;
  }
}
//------------------------------------------------------------------------------------------
//  getNextHeadPos
//------------------------------------------------------------------------------------------
CirculatedActionSet.prototype.getNextHeadPos = function() {
  let nextHeadPos;

  if (this.curDegree % 90 == 0) {
    nextHeadPos = appDataManager.getNextPos(this.body.dataList[0].pos,
      (((this.body.curMovingDir - EN_.KEY._LEFT) + (this.curDegree / 90)) % 4 + EN_.KEY._LEFT));
  } else {
    let curMovingDirHalfVec = ((this.body.curMovingDir - EN_.KEY._LEFT) + ((this.curDegree - 45) / 90)) % 4;
    nextHeadPos = appDataManager.getNextPos(appDataManager.getNextPos(this.body.dataList[0].pos, (curMovingDirHalfVec + EN_.KEY._LEFT)), ((curMovingDirHalfVec + 1) % 4 + EN_.KEY._LEFT));
  }

  return nextHeadPos;
}
