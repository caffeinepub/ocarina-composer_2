import type { BodyShape } from '../types/shapes';

export interface HolePosition {
  x: number;
  y: number;
}

export interface HoleLayout {
  leftIndex: HolePosition;
  leftMiddle: HolePosition;
  rightIndex: HolePosition;
  rightMiddle: HolePosition;
}

/**
 * Returns consistent hole positions for all components.
 * Coordinates are relative to a container with width=384px (w-96) and height=224px (h-56).
 */
export function getHoleLayout(_bodyShape: BodyShape): HoleLayout {
  const centerY = 112;
  const leftX = 120;
  const rightX = 264;
  const indexY = centerY - 36;
  const middleY = centerY + 36;

  return {
    leftIndex:  { x: leftX,  y: indexY  },
    leftMiddle: { x: leftX,  y: middleY },
    rightIndex: { x: rightX, y: indexY  },
    rightMiddle:{ x: rightX, y: middleY },
  };
}
