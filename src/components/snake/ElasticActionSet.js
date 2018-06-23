import * as EN_ from '../../include/Enums'

import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

//------------------------------------------------------------------------------------------
//  ElasticActionSet
//------------------------------------------------------------------------------------------
export function ElasticActionSet(body) {
  NormalActionSet.call(this, body);

  this.body.isShrinking = true;
}
ElasticActionSet.prototype = Object.create(NormalActionSet.prototype);
//------------------------------------------------------------------------------------------
//  getNextHeadPos
//------------------------------------------------------------------------------------------
ElasticActionSet.prototype.getNextHeadPos = function() {
  let nextHeadPos = undefined;

  if (!this.body.isShrinking) {
    nextHeadPos = NormalActionSet.prototype.getNextHeadPos.call(this);
  }

  return nextHeadPos;
}
//------------------------------------------------------------------------------------------
//  shouldUpdateTailPos
//------------------------------------------------------------------------------------------
ElasticActionSet.prototype.shouldUpdateTailPos = function() {
  return (this.body.isShrinking && this.body.dataList.length > 1) || NormalActionSet.prototype.shouldUpdateTailPos.call(this);
}
//------------------------------------------------------------------------------------------
//  handleActCtrl
//------------------------------------------------------------------------------------------
ElasticActionSet.prototype.handleActCtrl = function(key) {
  switch (key) {
    case EN_.KEY._BTN_A:
      this.body.isShrinking = !this.body.isShrinking;
      break;
  }
}
