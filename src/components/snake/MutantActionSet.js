import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

export function MutantActionSet(body) {
  NormalActionSet.call(this, body);
}

MutantActionSet.prototype = Object.create(NormalActionSet.prototype);
