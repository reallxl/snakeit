import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

export function CirculatedActionSet(body) {
  NormalActionSet.call(this, body);
}

CirculatedActionSet.prototype = Object.create(NormalActionSet.prototype);
