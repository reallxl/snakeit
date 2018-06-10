import * as EN_ from '../../include/Enums'
import * as PA_ from '../../include/Params'

import { appDataManager } from '../../main'

export function Prey({
  pos = null,
  effect = PA_.DEFAULT_EFFECT,
} = {}) {
  this.pos = pos || appDataManager.getRandomAvailablePos();
  this.effect = effect;
}
