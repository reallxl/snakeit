import { CBasicPhaseHandler } from './CBasicPhaseHandler'

export class CReversedEffectModifier extends CBasicPhaseHandler {
  /*constructor(processor) {
      super(processor);
  }*/

  init() {
    if (this.processor.snake.length > this.processor.snake.bodyData.length) {
      //--- update total body length if needed
      this.processor.snake.length = this.processor.snake.bodyData.length;
    }

    //--- predict virtual trailing data
    let nextHeadPos = this.processor.getNextPos(this.processor.snake.bodyData[0].pos, this.processor.snake.curHeadingDir);

    this.processor.snake.curHeadingDir = this.processor.getMovingDir(this.processor.snake.bodyData[this.processor.snake.bodyData.length - 1].pos, this.processor.snake.trailingData[0].pos);
    this.processor.snake.bodyData.reverse();
    this.processor.snake.trailingData = [{
      pos: nextHeadPos,
    }];
  }
}
