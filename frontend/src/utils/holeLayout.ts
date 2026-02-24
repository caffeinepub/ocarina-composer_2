import type { BodyShape } from '../App';

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
 * Returns consistent hole positions for all components
 * Coordinates are relative to a container with width=384px (w-96) and height=224px (h-56)
 * These positions work for the rotated ocarina visual
 */
export function getHoleLayout(bodyShape: BodyShape): HoleLayout {
  // Base layout: holes are positioned symmetrically
  // Left holes on the left side, right holes on the right side
  // Index fingers (front) above middle fingers (back)
  
  const centerY = 112; // Half of 224px height
  const leftX = 120; // Left side position
  const rightX = 264; // Right side position
  const indexY = centerY - 36; // Front holes (index fingers)
  const middleY = centerY + 36; // Back holes (middle fingers)

  return {
    leftIndex: { x: leftX, y: indexY },
    leftMiddle: { x: leftX, y: middleY },
    rightIndex: { x: rightX, y: indexY },
    rightMiddle: { x: rightX, y: middleY },
  };
}
