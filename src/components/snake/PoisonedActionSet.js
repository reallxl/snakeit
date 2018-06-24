import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

//------------------------------------------------------------------------------------------
//  PoisonedActionSet
//------------------------------------------------------------------------------------------
export function PoisonedActionSet(body) {
  NormalActionSet.call(this, body);
}
PoisonedActionSet.prototype = Object.create(NormalActionSet.prototype);
