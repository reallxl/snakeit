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
//  getNextHeadPos
//------------------------------------------------------------------------------------------
DimensionalActionSet.prototype.getNextHeadPos = function() {
  let nextHeadPos;

  if (this.body.nextHeadPos) {
    nextHeadPos = this.body.nextHeadPos;
    this.body.nextHeadPos = undefined;
  } else {
    nextHeadPos = NormalActionSet.prototype.getNextHeadPos.call(this);
  }

  return nextHeadPos;
}
//------------------------------------------------------------------------------------------
//  handleCtrl
//------------------------------------------------------------------------------------------
DimensionalActionSet.prototype.handleCtrl = function(key) {
  switch (key) {
    case EN_.KEY._BTN_A:
      this.body.nextHeadPos = appDataManager.getRandomAvailablePos();
      break;
  }
}
