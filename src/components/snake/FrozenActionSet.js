import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

export function FrozenActionSet(body) {
  NormalActionSet.call(this, body);
}

FrozenActionSet.prototype = Object.create(NormalActionSet.prototype);
