import * as EN_ from '../include/Enums'
import * as PA_ from '../include/Params'

import { appEventBus } from '../main'

import { Prey } from './prey/Prey'

//------------------------------------------------------------------------------------------
//  GameProcessor
//------------------------------------------------------------------------------------------
export function GameProcessor(snakeList, preyList) {
  this.snakeList = snakeList;
  this.curActiveSnakeId = 0;

  this.preyList = preyList;

  this.turnProcID = NaN;
}
//------------------------------------------------------------------------------------------
//  run
//------------------------------------------------------------------------------------------
GameProcessor.prototype.run = function() {
  this.runSingleGameTurn();
}
//------------------------------------------------------------------------------------------
//  stop
//------------------------------------------------------------------------------------------
GameProcessor.prototype.stop = function() {
  let self = this;
  clearTimeout(self.turnProcID);
  this.turnProcID = NaN;
}
//------------------------------------------------------------------------------------------
//  runSingleGameTurn
//------------------------------------------------------------------------------------------
GameProcessor.prototype.runSingleGameTurn = function() {
  //this.dataManager.fetch();

  this.snakeList.forEach((snake) => {
    //--- advance snake head position
    let nextHeadPos = snake.getNextHeadPos();

    if (snake.isColliding(nextHeadPos)) {
      //--- colliding (i.e. GAME OVER)
      return appEventBus.$emit('gameOver', {
        pos: nextHeadPos,
      });
    } else if (nextHeadPos != undefined) {
      snake.updateHeadPos(nextHeadPos);
    }

    //--- apply action effect upon preying
    let eatenPrey = this.preyList.find((prey) => {
      return prey.pos == nextHeadPos || //--- quick check
        snake.body.dataList.find((bodyNode) => {
          return prey.pos == bodyNode.pos;
        });
    });

    if (eatenPrey) {
      snake.grow(eatenPrey.effect);

      if (eatenPrey.effect != EN_.EFFECT._NONE) {
        this.preyList.unshift(new Prey());
      }
      this.preyList.splice(this.preyList.indexOf(eatenPrey), 1);
    }

    //--- advance snake tail position
    if (snake.shouldUpdateTailPos()) {
      snake.updateTrailingData(snake.updateTailPos());
    }

    switch (snake.applyPostEffect()) {
      case EN_.RES._RESET:
        snake.updateBodyEffect(EN_.EFFECT._NORMAL, false);
        break;
      default:
        break;
    }
  });

  //this.dataManager.submit();
  appEventBus.$emit('render');

  //--- schedule next frame update
  let self = this;
  this.turnProcID = setTimeout( function() {
    self.runSingleGameTurn();
  }, PA_.GAME_UPDATE_TICK, this);
}
//------------------------------------------------------------------------------------------
//  handleMovCtrl
//------------------------------------------------------------------------------------------
GameProcessor.prototype.handleMovCtrl = function(dir) {
  this.snakeList[this.curActiveSnakeId].handleMovCtrl(dir);
}
//------------------------------------------------------------------------------------------
//  handleActCtrl
//------------------------------------------------------------------------------------------
GameProcessor.prototype.handleActCtrl = function(key) {
  this.snakeList[this.curActiveSnakeId].handleActCtrl(key);
}
