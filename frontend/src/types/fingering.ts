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

// Note names across all three octave ranges
export const NOTE_NAMES = [
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
  'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5',
  'C6', 'D6', 'E6', 'F6', 'G6', 'A6', 'B6', 'C7',
] as const;
export type NoteName = typeof NOTE_NAMES[number];

// Ocarina size preset type
export type OcarinaSizePreset = 'Small' | 'Medium' | 'Large';

// Octave offset per preset (relative to Medium = C5–C6)
export const OCARINA_SIZE_OCTAVE_OFFSET: Record<OcarinaSizePreset, number> = {
  Small: 1,   // C6–C7
  Medium: 0,  // C5–C6 (default)
  Large: -1,  // C4–C5
};

// Base notes in the C5–C6 range (Medium preset)
const BASE_NOTES = ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'];

// Get notes for a given preset
export function getNotesForPreset(preset: OcarinaSizePreset): string[] {
  const offset = OCARINA_SIZE_OCTAVE_OFFSET[preset];
  return BASE_NOTES.map((note) => {
    const match = note.match(/^([A-G]#?)(\d)$/);
    if (!match) return note;
    const pitch = match[1];
    const octave = parseInt(match[2]) + offset;
    return `${pitch}${octave}`;
  });
}
