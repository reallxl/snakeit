import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

export function PoisonedActionSet(body) {
  NormalActionSet.call(this, body);
}

PoisonedActionSet.prototype = Object.create(NormalActionSet.prototype);
