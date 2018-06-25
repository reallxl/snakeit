import * as EN_ from '../../include/Enums'
import * as PA_ from '../../include/Params'

import { appDataManager } from '../../main'
import { appEventBus } from '../../main'

import { NormalActionSet } from './NormalActionSet'

//------------------------------------------------------------------------------------------
//  TimeBombActionSet
//------------------------------------------------------------------------------------------
export function TimeBombActionSet(body) {
  NormalActionSet.call(this, body);

  this.bombingNodeNum = Math.floor(Math.random() * (this.body.dataList.length - 1)) + 1;
  this.maxTick = Math.floor(Math.random() * PA_.BOMBER_MAX_COUNTDOWN) + 1;
  this.curTick = 0;
}
TimeBombActionSet.prototype = Object.create(NormalActionSet.prototype);
//------------------------------------------------------------------------------------------
//  applyPostEffect
//------------------------------------------------------------------------------------------
TimeBombActionSet.prototype.applyPostEffect = function() {
  if (this.curTick < this.maxTick) {
    this.curTick++;

    if (this.curTick == this.maxTick) {
      this.body.trailingDataList = [
        this.body.dataList[this.body.dataList.length - this.bombingNodeNum],
      ];

      let cnt = 0;
      for (let n = 0; n < this.bombingNodeNum; n++) {
        appEventBus.$emit('preySpawn', {
          effect: EN_.EFFECT._NONE,
          color: PA_.DEFAULT_SNAKE_COLOR,
        });

        this.body.dataList.pop();
      }

      this.body.length = this.body.dataList.length;

      return EN_.RES._RESET;
    }
    else {
      appEventBus.$emit('colorSetUpdate', [
        {
          key: 'snake',
          val: PA_.BOMBER_COLOR[Math.floor((this.maxTick - this.curTick) * PA_.BOMBER_COLOR.length / this.maxTick)],
        },
      ]);
    }
  }
}
