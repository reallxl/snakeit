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

  //this.effect = undefined;
  //this.actionSet = undefined;
  this.updateBodyEffect(effect, false);
}
//------------------------------------------------------------------------------------------
//  grow
//------------------------------------------------------------------------------------------
Snake.prototype.grow = function(effect) {
  //--- update action set based on prey effect
  this.updateBodyEffect(effect);
};
//------------------------------------------------------------------------------------------
//  updateBodyEffect
//------------------------------------------------------------------------------------------
Snake.prototype.updateBodyEffect = function(effect, onGrowing = true) {
  //--- update action set based on prey effect
  if (effect != EN_.EFFECT._NONE && effect != this.effect) {
    this.effect = effect;

    switch (this.effect) {
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
        this.actionSet = new ElasticActionSet(this.body);
        break;
      default:
        this.actionSet = new NormalActionSet(this.body);
        break;
    }
  }

  this.actionSet.applyEffect(onGrowing);
};
//------------------------------------------------------------------------------------------
//  handleMovCtrl
//------------------------------------------------------------------------------------------
Snake.prototype.handleMovCtrl = function(dir) {
  return this.actionSet.handleMovCtrl(dir);
}
//------------------------------------------------------------------------------------------
//  handleActCtrl
//------------------------------------------------------------------------------------------
Snake.prototype.handleActCtrl = function(key) {
  return this.actionSet.handleActCtrl(key);
}
//------------------------------------------------------------------------------------------
//  runSingleStep
//------------------------------------------------------------------------------------------
Snake.prototype.runSingleStep = function() {
  return this.actionSet.runSingleStep();
}
//------------------------------------------------------------------------------------------
//  getNextHeadPos
//------------------------------------------------------------------------------------------
Snake.prototype.getNextHeadPos = function() {
  return this.actionSet.getNextHeadPos();
}
//------------------------------------------------------------------------------------------
//  isColliding
//------------------------------------------------------------------------------------------
Snake.prototype.isColliding = function(nextHeadPos) {
  return this.actionSet.isColliding(nextHeadPos);
}
//------------------------------------------------------------------------------------------
//  updateHeadPos
//------------------------------------------------------------------------------------------
Snake.prototype.updateHeadPos = function(nextHeadPos) {
  return this.actionSet.updateHeadPos(nextHeadPos);
}
//------------------------------------------------------------------------------------------
//  shouldUpdateTailPos
//------------------------------------------------------------------------------------------
Snake.prototype.shouldUpdateTailPos = function() {
  return this.actionSet.shouldUpdateTailPos();
}
//------------------------------------------------------------------------------------------
//  updateTailPos
//------------------------------------------------------------------------------------------
Snake.prototype.updateTailPos = function() {
  return this.actionSet.updateTailPos();
}
//------------------------------------------------------------------------------------------
//  updateTrailingData
//------------------------------------------------------------------------------------------
Snake.prototype.updateTrailingData = function(lastTailData) {
  return this.actionSet.updateTrailingData(lastTailData);
}
//------------------------------------------------------------------------------------------
//  applyPostEffect
//------------------------------------------------------------------------------------------
Snake.prototype.applyPostEffect = function() {
  return this.actionSet.applyPostEffect();
}
