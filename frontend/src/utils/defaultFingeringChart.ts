import type { FingeringChart } from '../types/fingering';

// Default 4-hole ocarina fingering chart
// Covers all three octave ranges: C4–C5 (Large), C5–C6 (Medium), C6–C7 (Small)
export const defaultFingeringChart: FingeringChart = {
  // Large preset range (C4–C5)
  'C4': { leftIndex: true,  leftMiddle: true,  rightIndex: true,  rightMiddle: true  },
  'D4': { leftIndex: true,  leftMiddle: true,  rightIndex: true,  rightMiddle: false },
  'E4': { leftIndex: true,  leftMiddle: true,  rightIndex: false, rightMiddle: false },
  'F4': { leftIndex: true,  leftMiddle: false, rightIndex: true,  rightMiddle: false },
  'G4': { leftIndex: true,  leftMiddle: false, rightIndex: false, rightMiddle: false },
  'A4': { leftIndex: false, leftMiddle: true,  rightIndex: false, rightMiddle: false },
  'B4': { leftIndex: false, leftMiddle: false, rightIndex: true,  rightMiddle: false },
  'C5': { leftIndex: false, leftMiddle: false, rightIndex: false, rightMiddle: false },

  // Medium preset range (C5–C6) — same fingering pattern, different octave label
  'D5': { leftIndex: true,  leftMiddle: true,  rightIndex: true,  rightMiddle: false },
  'E5': { leftIndex: true,  leftMiddle: true,  rightIndex: false, rightMiddle: false },
  'F5': { leftIndex: true,  leftMiddle: false, rightIndex: true,  rightMiddle: false },
  'G5': { leftIndex: true,  leftMiddle: false, rightIndex: false, rightMiddle: false },
  'A5': { leftIndex: false, leftMiddle: true,  rightIndex: false, rightMiddle: false },
  'B5': { leftIndex: false, leftMiddle: false, rightIndex: true,  rightMiddle: false },
  'C6': { leftIndex: false, leftMiddle: false, rightIndex: false, rightMiddle: false },

  // Small preset range (C6–C7)
  'D6': { leftIndex: true,  leftMiddle: true,  rightIndex: true,  rightMiddle: false },
  'E6': { leftIndex: true,  leftMiddle: true,  rightIndex: false, rightMiddle: false },
  'F6': { leftIndex: true,  leftMiddle: false, rightIndex: true,  rightMiddle: false },
  'G6': { leftIndex: true,  leftMiddle: false, rightIndex: false, rightMiddle: false },
  'A6': { leftIndex: false, leftMiddle: true,  rightIndex: false, rightMiddle: false },
  'B6': { leftIndex: false, leftMiddle: false, rightIndex: true,  rightMiddle: false },
  'C7': { leftIndex: false, leftMiddle: false, rightIndex: false, rightMiddle: false },
};
