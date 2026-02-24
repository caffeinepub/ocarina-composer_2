// Type definitions for ocarina fingering configuration

// Hole identifiers for a 4-hole ocarina
export type HoleId = 'leftIndex' | 'leftMiddle' | 'rightIndex' | 'rightMiddle';

// Fingering pattern: maps each hole to its state (true = covered, false = open)
export interface FingeringPattern {
  leftIndex: boolean;
  leftMiddle: boolean;
  rightIndex: boolean;
  rightMiddle: boolean;
}

// Complete fingering chart: maps note names to their fingering patterns
export type FingeringChart = Record<string, FingeringPattern>;

// Note names in an octave, plus C6 for the octave note
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C6'] as const;
export type NoteName = typeof NOTE_NAMES[number];
