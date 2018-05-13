import { DataManager } from '../../main'

import { NormalActionSet } from './NormalActionSet'

export function ReversedActionSet(body) {
  NormalActionSet.call(this, body);
  
  //--- update total body length if needed
  if (this.body.length > this.body.dataList.length) {
    this.body.length = this.body.dataList.length;
  }

  //--- predict virtual trailing data
  let nextHeadPos = DataManager.getNextPos(this.body.dataList[0].pos, this.body.curMovingDir);

  this.body.curMovingDir = DataManager.getMovingDir(this.body.dataList[this.body.dataList.length - 1].pos, this.body.trailingDataList[0].pos);
  this.body.dataList.reverse();
  this.body.trailingDataList = [{
    pos: nextHeadPos,
  }];
}

ReversedActionSet.prototype = Object.create(NormalActionSet.prototype);
