import * as PA_ from '../../include/Params'

import { appDataManager } from '../../main'
import { appEventBus } from '../../main'

import { NormalActionSet } from './NormalActionSet'

//------------------------------------------------------------------------------------------
//  FrozenActionSet
//------------------------------------------------------------------------------------------
export function FrozenActionSet(body) {
  NormalActionSet.call(this, body);

  this.slidingDir = undefined;
}
FrozenActionSet.prototype = Object.create(NormalActionSet.prototype);
//------------------------------------------------------------------------------------------
//  applyEffect
//------------------------------------------------------------------------------------------
FrozenActionSet.prototype.applyEffect = function(onGrowing) {
  if (this.slidingDir == undefined) {
    NormalActionSet.prototype.applyEffect.call(this, onGrowing);
  } else {
    //--- dummy
  }
}
//------------------------------------------------------------------------------------------
//  getNextHeadPos
//------------------------------------------------------------------------------------------
FrozenActionSet.prototype.getNextHeadPos = function() {
  let nextHeadPos;

  if (Math.random() >= PA_.FROZEN_CHANCE) {
    //--- recover to normal movement
    this.slidingDir = undefined;
    appEventBus.$emit('colorSetUpdate', [
      {
        key: 'snakeHead',
        val: PA_.DEFAULT_SNAKE_HEAD_COLOR,
      },
      {
        key: 'snake',
        val: PA_.DEFAULT_SNAKE_COLOR,
      },
    ]);

    nextHeadPos = NormalActionSet.prototype.getNextHeadPos.call(this);
  } else {
    //--- frozen movement
    if (this.slidingDir == undefined) {
      //--- initialize
      this.slidingDir = this.body.curMovingDir;
      appEventBus.$emit('colorSetUpdate', [
        {
          key: 'snakeHead',
          val: PA_.FROZEN_COLOR,
        },
        {
          key: 'snake',
          val: PA_.FROZEN_COLOR,
        },
      ]);

      if (this.body.length > this.body.dataList.length) {
        this.body.length = this.body.dataList.length;
      }
    }

    this.body.dataList.forEach((bodyNode) => {
      bodyNode.pos = appDataManager.getNextPos(bodyNode.pos, this.slidingDir);
    });

    //--- implies to do nothing else
    nextHeadPos = undefined;
  }

  return nextHeadPos;
}
//------------------------------------------------------------------------------------------
//  isColliding
//------------------------------------------------------------------------------------------
FrozenActionSet.prototype.isColliding = function(nextHeadPos) {
  let ret = false;

  if (this.slidingDir == undefined) {
    ret = NormalActionSet.prototype.isColliding.call(this, nextHeadPos);
  }

  return ret;
}
//------------------------------------------------------------------------------------------
//  handleMovCtrl
//------------------------------------------------------------------------------------------
FrozenActionSet.prototype.handleMovCtrl = function(dir) {
  if (this.slidingDir == undefined) {
    NormalActionSet.prototype.handleMovCtrl.call(this, dir);
  } else {
    this.slidingDir = dir;
  }
}
