import type { FingeringChart } from '../types/fingering';

// Default 4-hole ocarina fingering chart
// Based on standard pendant ocarina fingering patterns
// Key note (all holes closed) = C
// C6 is one octave higher with all holes open
export const defaultFingeringChart: FingeringChart = {
  'C': { leftIndex: true, leftMiddle: true, rightIndex: true, rightMiddle: true },
  'C#': { leftIndex: true, leftMiddle: true, rightIndex: true, rightMiddle: false },
  'D': { leftIndex: true, leftMiddle: true, rightIndex: false, rightMiddle: false },
  'D#': { leftIndex: true, leftMiddle: false, rightIndex: false, rightMiddle: false },
  'E': { leftIndex: false, leftMiddle: true, rightIndex: false, rightMiddle: false },
  'F': { leftIndex: false, leftMiddle: false, rightIndex: false, rightMiddle: false },
  'F#': { leftIndex: true, leftMiddle: true, rightIndex: false, rightMiddle: true },
  'G': { leftIndex: true, leftMiddle: false, rightIndex: false, rightMiddle: true },
  'G#': { leftIndex: false, leftMiddle: true, rightIndex: false, rightMiddle: true },
  'A': { leftIndex: false, leftMiddle: false, rightIndex: false, rightMiddle: true },
  'A#': { leftIndex: true, leftMiddle: true, rightIndex: true, rightMiddle: false },
  'B': { leftIndex: true, leftMiddle: true, rightIndex: false, rightMiddle: false },
  'C6': { leftIndex: false, leftMiddle: false, rightIndex: false, rightMiddle: false },
};
