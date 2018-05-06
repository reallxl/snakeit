import * as EN_ from '../../include/Enums'
import * as PA_ from '../../include/Params'

export class CBasicPhaseHandler {
  constructor(processor) {
    this.processor = processor;
  }

  init() {
  }

  runPreStepMovePhase(args) {
    return EN_.PHASE._HEAD_MOVE_CHECK;
  }
  runHeadMoveCheckPhase(args) {
    let nextHeadPos = this.processor.getNextPos(args.snakeData.bodyData[0].pos, args.snakeData.curHeadingDir);

    //--- colliding (i.e. GAME OVER)
    if (args.snakeData.bodyData.find((bodyNode) => {
      return bodyNode.pos == nextHeadPos;
    })) {
      args.res = -1;
      args.collidingPos = nextHeadPos;
      return EN_.PHASE._TERMINATE;
    }

    args.nextHeadPos = nextHeadPos;

    /*if (nextHeadPos == snakeData.curTailPos && snakeData.curLength == snakeData.length) {
      newData = Object.assign({}, this.dataMap[snakeData.curHeadPos]);

      newData.toDirCode = undefined;

      snakeData.curHeadPos = nextHeadPos;
      snakeData.curTailPos = this.getNextPos(snakeData.curTailPos);
      this.dataMap.splice(snakeData.curHeadPos, 1, newData);
      break;
    }*/

    let foundPrey = this.processor.prey.find((prey) => {
      return prey.pos == nextHeadPos;
    });

    if (foundPrey) {
      args.foundPrey = foundPrey;
    }

    //--- update current head position into bodyData
    args.snakeData.bodyData.unshift({
      pos: args.nextHeadPos,
    });

    return EN_.PHASE._HEAD_MOVE;
  }
  runHeadMovePhase(args) {
    if (args.foundPrey) {
      args.snakeData.length++;

      this.processor.prey.splice(this.processor.prey.indexOf(args.foundPrey), 1);
      this.processor.prey.unshift({
        pos: this.processor.getRandomAvailablePos(),
        effect: args.foundPrey.effect,
      });
    }



    return EN_.PHASE._TAIL_MOVE;
  }
  runTailMovePhase(args) {
    //--- update tail iff the body is completely in the dataMap
    if (args.snakeData.bodyData.length > args.snakeData.length) {
      args.snakeData.trailingData.unshift(args.snakeData.bodyData.pop());

      //--- update trailingData
      if (args.snakeData.trailingData.length > args.snakeData.trailingLength) {
        args.snakeData.trailingData.pop();
      }
    }

    return EN_.PHASE._POST_STEP_MOVE;
  }
  runPostStepMovePhase(args) {
    if (args.doAppointNextRound) {
      return EN_.PHASE._APPOINTMENT;
    } else {
      return EN_.PHASE._TERMINATE;
    }
  }
  runAppointmentPhase(args) {
    let tick = (100 * (PA_.MAX_GAME_LEVEL - (PA_.INIT_GAME_LEVEL - 1)));

    this.processor.stepProcID = setTimeout(this.processor.startNewRound, tick);
    return EN_.PHASE._TERMINATE;
  }
}
