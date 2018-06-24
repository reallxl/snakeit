import * as EN_ from '../../include/Enums'
import * as PA_ from '../../include/Params'

import { appDataManager } from '../../main'

//------------------------------------------------------------------------------------------
//  Prey
//------------------------------------------------------------------------------------------
export function Prey({
  pos = appDataManager.getRandomAvailablePos(),
  effect = PA_.DEFAULT_EFFECT,
  color = undefined,
} = {}) {
  this.pos = pos;
  this.effect = effect;
  if (color) {
    this.color = color;
  }
}
