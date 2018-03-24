import { PHASE } from '../../include/Enums'

class PhaseProcessor() {
  constructor(effectModifier) {
    this.effectModifier = effectModifier;
  }

  //--- public APIs
  runPhase(phase) {
    switch (phase) {
      case _HEAD_MOVE:
        return this.procHeadMove;
      case _TAIL_MOVE:
        return this.procTailMove;
      case _SCHEDULE_NEXT_STEP:
        return this.procScheduleNextStep;
    }
  }

  //---

  //--- individual phase procedures
  procHeadMove() {
    /*
    do {
      let nextHeadPos, curPrey = undefined;

      //--- determine next head position
      nextHeadPos = this.getNextPos(snakeData.bodyData[0].pos, snakeData.curHeadingDir);

      let isColliding = false;
      if (snakeData.bodyData.find((bodyNode) => {
        return bodyNode.pos == nextHeadPos;
      })) {
        isColliding = true;
      }

      if (isColliding) {
        //--- colliding (i.e. GAME OVER)
        console.log('collide at:', this.DBGPOS(nextHeadPos));
        alert('Game Over!');
        return this.resetGame();
      }

      if (nextHeadPos == snakeData.curTailPos && snakeData.curLength == snakeData.length) {
        newData = Object.assign({}, this.map[snakeData.curHeadPos]);
        newData.toDirCode = undefined;

        snakeData.curHeadPos = nextHeadPos;
        snakeData.curTailPos = this.getNextPos(snakeData.curTailPos);
        this.map.splice(snakeData.curHeadPos, 1, newData);
        break;
      }

      //--- update current head position into bodyData
      snakeData.bodyData.unshift({
        pos: nextHeadPos,
      });

      if (this.map[snakeData.bodyData[0].pos] && this.map[snakeData.bodyData[0].pos].type == EN_.NODE_TYPE._PREY) {
        this._devourPrey(snakeData.bodyData[0].pos, snakeData);
      }

      //--- highlight current head position on map
      this.map.splice(snakeData.bodyData[0].pos, 1, {
        type: EN_.NODE_TYPE._SNAKE,
      });
    } while (0);*/
  }
  procTailMove() {

  }
  procScheduleNextStep() {

  }
}

export { PhaseProcessor };
