import * as PA_ from '../../include/Params'

import { appDataManager } from '../../main'
import { appEventBus } from '../../main'

import { NormalActionSet } from './NormalActionSet'

//------------------------------------------------------------------------------------------
//  ChameleonicActionSet
//------------------------------------------------------------------------------------------
export function ChameleonicActionSet(body) {
  NormalActionSet.call(this, body);

  this.curColorLv = 0;
}
ChameleonicActionSet.prototype = Object.create(NormalActionSet.prototype);
//------------------------------------------------------------------------------------------
//  applyPostEffect
//------------------------------------------------------------------------------------------
ChameleonicActionSet.prototype.applyPostEffect = function() {
  this.curColorLv = ((this.curColorLv + 1) % PA_.CHAMELEONIC_LEVEL.length);
  appEventBus.$emit('colorSetUpdate', [
    {
      key: 'snake',
      val: PA_.CHAMELEONIC_COLOR[PA_.CHAMELEONIC_LEVEL[this.curColorLv]],
    },
  ]);
}
