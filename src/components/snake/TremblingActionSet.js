import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

export function TremblingActionSet(body) {
  NormalActionSet.call(this, body);
}

TremblingActionSet.prototype = Object.create(NormalActionSet.prototype);
