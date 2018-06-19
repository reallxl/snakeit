import * as EN_ from '../../include/Enums'
import * as PA_ from '../../include/Params'

import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'
import { ReversedActionSet } from './ReversedActionSet'
import { DrunkActionSet } from './DrunkActionSet'
import { UpsideDownActionSet } from './UpsideDownActionSet'
import { HypedActionSet } from './HypedActionSet'
import { ChameleonicActionSet } from './ChameleonicActionSet'
import { PoisonedActionSet } from './PoisonedActionSet'
import { MutantActionSet } from './MutantActionSet'
import { SplitActionSet } from './SplitActionSet'
import { CirculatedActionSet } from './CirculatedActionSet'
import { FrozenActionSet } from './FrozenActionSet'
import { DimensionalActionSet } from './DimensionalActionSet'
import { TremblingActionSet } from './TremblingActionSet'
import { TimeBombActionSet } from './TimeBombActionSet'
import { ElasticActionSet } from './ElasticActionSet'

//------------------------------------------------------------------------------------------
//  Snake
//------------------------------------------------------------------------------------------
export function Snake({
  length = PA_.INIT_BODY_LENGTH,
  dataList = [],
  curMovingDir = EN_.KEY._RIGHT,
  trailingLength = PA_.INIT_TRAILING_LENGTH,
  trailingDataList = [],
  effect = EN_.EFFECT._NORMAL,
} = {}) {
  this.body = {
    length: length,
    dataList: dataList,
    curMovingDir: curMovingDir,
    trailingLength: trailingLength,
    trailingDataList: trailingDataList,
  };
  this.actionSet = undefined;

  this.updateBodyEffect(effect);
}
//------------------------------------------------------------------------------------------
//  grow
//------------------------------------------------------------------------------------------
Snake.prototype.grow = function(effect) {
  this.body.length++;

  //--- update action set based on prey effect
  this.updateBodyEffect(effect);
};
//------------------------------------------------------------------------------------------
//  updateBodyEffect
//------------------------------------------------------------------------------------------
Snake.prototype.updateBodyEffect = function(effect) {
  //--- update action set based on prey effect
  switch (effect) {
    case EN_.EFFECT._REVERSED:
      this.actionSet = new ReversedActionSet(this.body);
      break;
    case EN_.EFFECT._DRUNK:
      this.actionSet = new DrunkActionSet(this.body);
      break;
    case EN_.EFFECT._UPSIDEDOWN:
      this.actionSet = new UpsideDownActionSet(this.body);
      break;
    case EN_.EFFECT._HYPED:
      this.actionSet = new HypedActionSet(this.body);
      break;
    case EN_.EFFECT._CHAMELEONIC:
      this.actionSet = new ChameleonicActionSet(this.body);
      break;
    case EN_.EFFECT._POISONED:
      this.actionSet = new PoisonedActionSet(this.body);
      break;
    case EN_.EFFECT._MUTANT:
      this.actionSet = new MutantActionSet(this.body);
      break;
    case EN_.EFFECT._SPLIT:
      this.actionSet = new SplitActionSet(this.body);
      break;
    case EN_.EFFECT._CIRCULATED:
      this.actionSet = new CirculatedActionSet(this.body);
      break;
    case EN_.EFFECT._FROZEN:
      this.actionSet = new FrozenActionSet(this.body);
      break;
    case EN_.EFFECT._DIMENSIONAL:
      this.actionSet = new DimensionalActionSet(this.body);
      break;
    case EN_.EFFECT._TREMBLING:
      this.actionSet = new TremblingActionSet(this.body);
      break;
    case EN_.EFFECT._TIMEBOMB:
      this.actionSet  = new TimeBombActionSet(this.body);
      break;
    case EN_.EFFECT._ELASTIC:
      if (this.effect != EN_.EFFECT._ELASTIC) {
        this.actionSet = new ElasticActionSet(this.body);
        //console.log(this.actionSet.puppy, this.actionSet.isShrinking);
      }
      break;
    default:
      this.actionSet = new NormalActionSet(this.body);
      break;
  }
  this.effect = effect;
  console.log(this.actionSet.puppy, this.actionSet.isShrinking);

  //--- bypassing action methods
  this.getNextHeadPos = this.actionSet.getNextHeadPos;
  this.updateHeadPos = this.actionSet.updateHeadPos;
  this.doUpdateTailPos = this.actionSet.doUpdateTailPos;
  this.updateTailPos = this.actionSet.updateTailPos;
  this.updateTrailingData = this.actionSet.updateTrailingData;
  this.applyPostEffect = this.actionSet.applyPostEffect;

  this.preProcessDir = this.actionSet.preProcessDir;
  this.handleCtrl = this.actionSet.handleCtrl;
};
//------------------------------------------------------------------------------------------
//  updateMovingDir
//------------------------------------------------------------------------------------------
Snake.prototype.updateMovingDir = function(dir) {
  if (this.preProcessDir) {
    dir = this.preProcessDir(dir);
  }

  if ((this.body.dataList.length == 1 && dir != appDataManager.getMovingDir(this.body.dataList[0].pos, this.trailingData[0].pos)) ||
    (this.body.dataList.length > 1 && dir != appDataManager.getMovingDir(this.body.dataList[0].pos, this.body.dataList[1].pos))) {
    this.body.curMovingDir = dir;
  }
};
