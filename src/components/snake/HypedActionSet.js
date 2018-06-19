import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

export function HypedActionSet(body) {
  NormalActionSet.call(this, body);
}

HypedActionSet.prototype = Object.create(NormalActionSet.prototype);
