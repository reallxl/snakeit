import * as EN_ from '../include/Enums'
import * as PA_ from '../include/Params'

import { Prey } from './prey/Prey'

export function GameProcessor(dataMap, snakeList, preyList) {
  this.dataMap = dataMap;
  this.snakeList = snakeList;
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
    snake.updateHeadPos(nextHeadPos);

    //--- apply action effect upon preying
    let eatenPrey = this.preyList.find((prey) => {
      return prey.pos == nextHeadPos;
    });
    if (eatenPrey) {
      snake.grow(eatenPrey.effect);

      this.preyList.splice(this.preyList.indexOf(eatenPrey), 1);
      this.preyList.unshift(new Prey());
    }

    //--- advance snake tail position
    if (snake.doUpdateTailPos()) {
      snake.updateTrailingData(snake.updateTailPos());
    }

    if (snake.applyPostEffect) {
      snake.applyPostEffect();
    }
  });

  //this.dataManager.submit();
  //--- reset canvas
  this.dataMap.fill(null);

  //--- render snake
  this.snakeList.forEach((snake) => {
    snake.body.dataList.forEach((bodyNode) => {
      this.dataMap.splice(bodyNode.pos, 1, {
        type: EN_.NODE_TYPE._SNAKE,
        color: snake.body.dataList.indexOf(bodyNode) == 0 ?
          PA_.DEFAULT_SNAKE_HEAD_COLOR : PA_.DEFAULT_SNAKE_COLOR,
      });
    });
  });

  //--- render prey
  this.preyList.forEach((prey) => {
    this.dataMap.splice(prey.pos, 1, {
      type: EN_.NODE_TYPE._PREY,
    });
  });

  //--- schedule next frame update
  let self = this;
  this.turnProcID = setTimeout( function() {
    self.runSingleGameTurn();
  }, PA_.GAME_UPDATE_TICK, this);
}
