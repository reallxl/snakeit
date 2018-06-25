import * as EN_ from '../include/Enums'
import * as PA_ from '../include/Params'

import { appEventBus } from '../main'

import { Prey } from './prey/Prey'

import CloudPattern from './environment/CloudPattern'
import TreePattern from './environment/TreePattern'

//------------------------------------------------------------------------------------------
//  GameProcessor
//------------------------------------------------------------------------------------------
export function GameProcessor(snakeList, preyList, envObjList) {
  //--- snake
  this.snakeList = snakeList;
  this.curActiveSnakeId = 0;

  //--- prey
  this.preyList = preyList;

  //--- environmental object
  this.envObjList = envObjList;

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
//  updateLevel
//------------------------------------------------------------------------------------------
GameProcessor.prototype.updateLevel = function(level) {
  this.curLevel = level;
}
//------------------------------------------------------------------------------------------
//  runSingleGameTurn
//------------------------------------------------------------------------------------------
GameProcessor.prototype.runSingleGameTurn = function() {
  //this.dataManager.fetch();
  let ret = this.processPlayerPhase();

  if (ret != 0) {
    appEventBus.$emit('gameOver', {
      pos: ret.collidePos,
    });
  }
  this.processEnvironmentPhase();
  //this.dataManager.submit();
  appEventBus.$emit('render');

  //--- schedule next frame update
  let self = this;
  this.turnProcID = setTimeout( function() {
    self.runSingleGameTurn();
  }, 1000 / PA_.FRAME_RATE, this);
}
//------------------------------------------------------------------------------------------
//  processPlayerPhase
//------------------------------------------------------------------------------------------
GameProcessor.prototype.processPlayerPhase = function() {
  //--- snake movement
  this.snakeList.forEach((snake) => {
    if (snake.shouldMove()) {
      //--- advance snake head position
      let nextHeadPos = snake.getNextHeadPos();

      if (snake.isColliding(nextHeadPos)) {
        //--- colliding (i.e. GAME OVER)
        return {
          collidePos: nextHeadPos,
        };
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
        snake.updateBodyEffect(eatenPrey.effect);

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
    }
  });

  return 0;
}
//------------------------------------------------------------------------------------------
//  processEnvironmentPhase
//------------------------------------------------------------------------------------------
GameProcessor.prototype.processEnvironmentPhase = function() {
  //--- environment movement
  this.envObjList.forEach((obj) => {
    if (obj.curMoveTick == 0) {
      if (obj.curFrmNum != undefined) {
        obj.curFrmNum = (obj.curFrmNum + 1) % obj.pattern.frameList.length;
      }

      if (obj.dirList) {
        if (obj.curOfst == undefined) {
          obj.curOfst = {
            x: 0,
            y: 0,
          }
        }

        if (obj.dirList.includes(EN_.KEY._LEFT)) {
          obj.curOfst.x -= obj.speed;

          if (obj.curOfst.x < 0) {
            obj.startingPos--;
            obj.curOfst.x += PA_.BLOCK_WIDTH;
          }
        } else if (obj.dirList.includes(EN_.KEY._RIGHT)) {
          obj.curOfst.x += obj.speed;

          if (obj.curOfst.x >= PA_.BLOCK_WIDTH) {
            obj.startingPos++;
            obj.curOfst.x -= PA_.BLOCK_WIDTH;
          }
        }

        if (obj.dirList.includes(EN_.KEY._UP)) {
          obj.curOfst.y -= obj.speed;

          if (obj.curOfst.y < 0) {
            obj.startingPos -= PA_.DEFAULT_MAP_WIDTH;
            obj.curOfst.y += PA_.BLOCK_HEIGHT;
          }
        } else if (obj.dirList.includes(EN_.KEY._DOWN)) {
          obj.curOfst.y += obj.speed;

          if (obj.curOfst.y >= PA_.BLOCK_HEIGHT) {
            obj.startingPos += PA_.DEFAULT_MAP_WIDTH;
            obj.curOfst.y -= PA_.BLOCK_HEIGHT;
          }
        }
      }

      obj.curMoveTick = Math.floor(PA_.FRAME_RATE / obj.speed);
    } else {
      obj.curMoveTick--;
    }
  });

  return 0;
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
