export const
  //--- direction dirCode
  DIR = Object.freeze({
    _LEFT: 0,
    _UP: 1,
    _RIGHT: 2,
    _DOWN: 3,

    _BTN_A: 67,     //--- event.keyCode['c']
    _BTN_B: 88,     //--- event.keyCode['x']
    _BTN_C: 90,     //--- event.keyCode['z']

    _BASE: 37,      //--- event.keyCode['left']
  }),
  //--- node type
  NODE_TYPE = Object.freeze({
    _SNAKE: 0,
    _SNAKE_SPAN: 2,
    _PREY: 1,
  }),
  //--- effect
  EFFECT = Object.freeze({
    _NORMAL: 0,
    _REVERSED: 1,         //--- 17/12/25 //--- 18/01/13 //--- 18/02/04
    _DRUNK: 2,            //--- 17/12/27 //--- 18/01/14 //--- 18/02/04
    _UPSIDEDOWN: 3,       //--- 17/12/25 //--- 18/01/13
    _HYPED: 4,            //--- 17/12/25 //--- 18/01/13
    _CHAMELEONIC: 5,      //--- 17/12/25 //--- 18/01/14
    _ENLARGED: 6,         //--- 18/03/11 beta
    _MUTANT: 7,           //--- 18/02/04
    _SPLIT: 8,            //--- 18/03/11
    _CIRCULATED: 9,       //--- 18/02/07
    _FROZEN: 10,          //--- 17/12/26 //--- 18/01/14 //--- 18/02/04
    _DIMENSIONAL: 11,     //--- 18/02/05
    _EARTHQUAKE: 12,      //--- 18/02/08
    _BOMBER: 13,          //--- 18/02/04
    _WORMLIKE: 14,        //--- 18/03/11
  }),
  //--- effect action
  ACTION = Object.freeze({
    _INIT: 0,
    _STEP_MOVE: 1,
    _HEAD_MOVE: 2,
    _TAIL_MOVE: 3,
    _SCHEDULE_NEXT_STEP: 4,
    _CTRL_INPUT: 5,
    _ACTION: 6,
  }),

  //--------------------------------------------------
  END_OF_ENUMS_JS = -1;
