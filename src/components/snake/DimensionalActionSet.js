import * as EN_ from '../../include/Enums'

import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

//------------------------------------------------------------------------------------------
//  DimensionalActionSet
//------------------------------------------------------------------------------------------
export function DimensionalActionSet(body) {
  NormalActionSet.call(this, body);
}
DimensionalActionSet.prototype = Object.create(NormalActionSet.prototype);
//------------------------------------------------------------------------------------------
//  applyEffect
//------------------------------------------------------------------------------------------
DimensionalActionSet.prototype.applyEffect = function(onGrowing) {
  NormalActionSet.prototype.applyEffect.call(this, onGrowing);

  this.handleActCtrl(EN_.KEY._BTN_A);
}
//------------------------------------------------------------------------------------------
//  getNextHeadPos
//------------------------------------------------------------------------------------------
DimensionalActionSet.prototype.getNextHeadPos = function() {
  let nextHeadPos;

  if (this.nextHeadPos) {
    nextHeadPos = this.nextHeadPos;
    this.nextHeadPos = undefined;
  } else {
    nextHeadPos = NormalActionSet.prototype.getNextHeadPos.call(this);
  }

  return nextHeadPos;
}
//------------------------------------------------------------------------------------------
//  handleActCtrl
//------------------------------------------------------------------------------------------
DimensionalActionSet.prototype.handleActCtrl = function(key) {
  switch (key) {
    case EN_.KEY._BTN_A:
      this.nextHeadPos = appDataManager.getRandomAvailablePos();
      break;
  }
}
