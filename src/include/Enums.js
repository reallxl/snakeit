export const
  //--- game status
  STATUS = Object.freeze({
    _STOPPED: 0,
    _PLAYING: 1,
    _PAUSED: 2,
    _STEP: 3,
  }),
  //--- valid keyCode
  KEY = Object.freeze({
    _LEFT: 37,
    _UP: 38,
    _RIGHT: 39,
    _DOWN: 40,

    _BTN_A: 67,     //--- event.keyCode['c']
    _BTN_B: 88,     //--- event.keyCode['x']
    _BTN_C: 90,     //--- event.keyCode['z']
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
    _POISONED: 6,         //--- 18/03/11 beta
    _MUTANT: 7,           //--- 18/02/04
    _SPLIT: 8,            //--- 18/03/11
    _CIRCULATED: 9,       //--- 18/02/07
    _FROZEN: 10,          //--- 17/12/26 //--- 18/01/14 //--- 18/02/04
    _DIMENSIONAL: 11,     //--- 18/02/05
    _TREMBLING: 12,       //--- 18/02/08
    _TIMEBOMB: 13,        //--- 18/02/04
    _ELASTIC: 14,         //--- 18/03/11
  }),
  //--- effect action
  PHASE = Object.freeze({
    _INIT: 0,
    _PRE_STEP_MOVE: 1,
    _HEAD_MOVE_CHECK: 2,
    _HEAD_MOVE: 3,
    _TAIL_MOVE: 4,
    _POST_STEP_MOVE: 5,
    _APPOINTMENT: 6,
    _CTRL_INPUT: 7,
    _ACTION: 8,
    _TERMINATE: 999,
  }),

  //--------------------------------------------------
  END_OF_ENUMS_JS = -1;
