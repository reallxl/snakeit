import { EFFECT } from './Enums.js';

export const
  //--- map
  DEFAULT_MAP_WIDTH = 20,
  DEFAULT_MAP_HEIGHT = 10,
  DEFAULT_BG_COLOR = '#6E6E6E',
  DEFAULT_SNAKE_COLOR = '#000000',
  DEFAULT_SNAKE_HEAD_COLOR = '#FA5838',
  DEFAULT_PREY_COLOR = '#088A08',

  //--- basic parameters
  MAX_GAME_LEVEL = 10,
  INIT_GAME_LEVEL = 8,
  INIT_BODY_LENGTH = 10,
  INIT_TRAILING_LENGTH = 1,
  DEFAULT_EFFECT = EFFECT._SPLIT,

  //--- effect parameters
  DRUNK_LEVEL = [0.33, 0.83, 1, 1, 2, 2],
  DRUNK_COLOR = [

  ],
  DRUNK_LEVEL_PENALTY = 1,
  DRUNK_MAX_STEP = 3,
  HYPED_LEVEL = [2, 3, 3, 6, 6, 9, 9, 12],
  CHAMELEONIC_LEVEL = [0, 1, 2, 3, 3, 3, 3, 2, 1, 0],
  CHAMELEONIC_COLOR = [
    DEFAULT_SNAKE_COLOR,
    '#1C1C1C',
    '#585858',
    DEFAULT_BG_COLOR,
  ],
  ENLARGED_MAX_RATIO = 2,
  FROZEN_CHANCE = 0.7,
  FROZEN_COLOR = '#58D3F7',
  BOMBER_MAX_COUNTDOWN = 10,
  BOMBER_COLOR = [
    DEFAULT_SNAKE_COLOR,
    '#FF0000',
    '#FE2E2E',
    '#FA5858',
    '#F78181',
    '#F5A9A9',
  ],

  //--------------------------------------------------
  END_OF_PARAMS_JS = -1;
