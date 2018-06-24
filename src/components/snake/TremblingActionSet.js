import { appDataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

//------------------------------------------------------------------------------------------
//  TremblingActionSet
//------------------------------------------------------------------------------------------
export function TremblingActionSet(body) {
  NormalActionSet.call(this, body);
}
TremblingActionSet.prototype = Object.create(NormalActionSet.prototype);
//------------------------------------------------------------------------------------------
//  applyEffect
//------------------------------------------------------------------------------------------
TremblingActionSet.prototype.applyEffect = function() {
  let shakingDir = Math.floor(Math.random() * 4);

  this.body.dataList.forEach((bodyNode) => {
    this.map.splice(bodyNode.pos, 1, null);
    bodyNode.pos = this.getNextPos(bodyNode.pos, shakingDir);
  });
  this.body.dataList.forEach((bodyNode) => {
    if (this.body.dataList.indexOf(bodyNode) == 0) {
      if (this.map[bodyNode.pos] && this.map[bodyNode.pos].type == EN._NODE_TYPE._PREY) {
        this._devourPrey(nodyNode.pos, this.snake);
      }
      this.map.splice(bodyNode.pos, 1, {
        type: EN._NODE_TYPE._SNAKE,
        color: PA_.DEFAULT_SNAKE_HEAD_COLOR,
      });
    } else {
      if (this.map[bodyNode.pos] && this.map[bodyNode.pos].type == EN._NODE_TYPE._PREY) {
        this._scoutNewPrey();
      }
      this.map.splice(bodyNode.pos, 1, {
        type: EN._NODE_TYPE._SNAKE,
      });
    }
  });

  setTimeout(this._applyEarthQuakeEffect, (40 * (Math.floor(Math.random() * 10) + 1)));
}
