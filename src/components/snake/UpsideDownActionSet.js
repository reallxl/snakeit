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
//  preProcessDir
//------------------------------------------------------------------------------------------
UpsideDownActionSet.prototype.preProcessDir = function(dir) {
  return (EN_.KEY._LEFT + (((dir - EN_.KEY._LEFT) + 2) % 4));;
};
