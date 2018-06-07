import { PIXEL_BLOCK_WIDTH, PIXEL_BLOCK_HEIGHT } from "../../include/Params"

export default {
  width: 2 * PIXEL_BLOCK_WIDTH,
  height: 2 * PIXEL_BLOCK_HEIGHT,
  curFrameNum: 0,
  frameList: [
    //--- frame 0
    {
      colorList: [
        '#006600',
        '#008000',
        "#009900",
        "#FFFF00",
      ],
      dataMap: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
        0, 0, 0, 0, 1, 4, 1, 0, 0, 0,
        0, 0, 1, 1, 2, 1, 1, 1, 0, 0,
        0, 1, 3, 1, 2, 1, 4, 1, 0, 0,
        0, 0, 1, 3, 3, 2, 1, 0, 0, 0,
        0, 1, 1, 3, 2, 1, 1, 0, 0, 0,
        1, 3, 3, 1, 4, 2, 2, 1, 0, 0,
        2, 2, 3, 3, 3, 2, 1, 2, 1, 0,
        0, 0, 1, 3, 2, 2, 1, 0, 0, 0,
      ],
    },
    //--- frame 1
    {
      colorList: [
        '#006600',
        '#008000',
        "#009900",
        "#FFFF00",
      ],
      dataMap: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
        0, 0, 0, 1, 4, 1, 0, 0, 0, 0,
        0, 0, 1, 1, 2, 1, 1, 1, 0, 0,
        0, 1, 4, 2, 2, 1, 4, 1, 0, 0,
        0, 0, 1, 3, 2, 2, 1, 0, 0, 0,
        0, 1, 1, 3, 3, 1, 1, 0, 0, 0,
        1, 3, 3, 1, 3, 2, 2, 1, 0, 0,
        2, 2, 3, 3, 3, 2, 1, 2, 1, 0,
        0, 0, 1, 3, 2, 2, 1, 0, 0, 0,
      ],
    },
  ],
}