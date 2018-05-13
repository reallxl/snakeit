import * as EN_ from '../../include/Enums'
import * as PA_ from '../../include/Params'

import { DataManager } from '../../main'

export function Prey({
  pos = null,
  effect = PA_.DEFAULT_EFFECT,
} = {}) {
  this.pos = pos || DataManager.getRandomAvailablePos();
  this.effect = effect;
}
