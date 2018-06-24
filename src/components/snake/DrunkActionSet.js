import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

//------------------------------------------------------------------------------------------
//  DrunkActionSet
//------------------------------------------------------------------------------------------
export function DrunkActionSet(body) {
  NormalActionSet.call(this, body);
}
DrunkActionSet.prototype = Object.create(NormalActionSet.prototype);
