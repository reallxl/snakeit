import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

//------------------------------------------------------------------------------------------
//  SplitActionSet
//------------------------------------------------------------------------------------------
export function SplitActionSet(body) {
  NormalActionSet.call(this, body);
}
SplitActionSet.prototype = Object.create(NormalActionSet.prototype);
