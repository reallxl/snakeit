import * as EN_ from '../../include/Enums'

import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

//------------------------------------------------------------------------------------------
//  UpsideDownActionSet
//------------------------------------------------------------------------------------------
export function UpsideDownActionSet(body) {
  NormalActionSet.call(this, body);
}
UpsideDownActionSet.prototype = Object.create(NormalActionSet.prototype);
//------------------------------------------------------------------------------------------
//  handleMovCtrl
//------------------------------------------------------------------------------------------
UpsideDownActionSet.prototype.handleMovCtrl = function(dir) {
  NormalActionSet.prototype.handleMovCtrl.call(this, EN_.KEY._LEFT + (((dir - EN_.KEY._LEFT) + 2) % 4));
};
