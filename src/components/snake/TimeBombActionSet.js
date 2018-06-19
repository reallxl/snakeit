import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

export function TimeBombActionSet(body) {
  NormalActionSet.call(this, body);
}

TimeBombActionSet.prototype = Object.create(NormalActionSet.prototype);
