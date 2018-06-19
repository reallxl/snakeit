import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

export function ChameleonicActionSet(body) {
  NormalActionSet.call(this, body);
}

ChameleonicActionSet.prototype = Object.create(NormalActionSet.prototype);
