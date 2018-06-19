import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

export function DimensionalActionSet(body) {
  NormalActionSet.call(this, body);
}

DimensionalActionSet.prototype = Object.create(NormalActionSet.prototype);
