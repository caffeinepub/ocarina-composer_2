import type { Note } from '../backend';
import type { OcarinaSizePreset } from '../types/fingering';
import { getNotesForPreset } from '../types/fingering';

export interface TransposeResult {
  notes: Note[];
  totalImported: number;
  transposedCount: number;
  skippedCount: number;
}

/** Extract the pitch letter(s) and octave number from a note string like "C#4" */
function parsePitch(pitch: string): { letter: string; octave: number } | null {
  const match = pitch.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) return null;
  return { letter: match[1], octave: parseInt(match[2]) };
}

/** Transpose a note to fit within the available notes for the given preset */
export function transposeNotesToPreset(
  notes: Note[],
  preset: OcarinaSizePreset
): TransposeResult {
  const availableNotes = getNotesForPreset(preset);

  // Build a set of available pitch letters (ignoring octave) for quick lookup
  const availableLetters = new Set(
    availableNotes.map((n) => {
      const parsed = parsePitch(n);
      return parsed?.letter ?? '';
    })
  );

  // Determine octave range from available notes
  const octaves = availableNotes
    .map((n) => parsePitch(n)?.octave ?? 0)
    .filter((o) => o > 0);
  const minOctave = Math.min(...octaves);
  const maxOctave = Math.max(...octaves);

  let transposedCount = 0;
  let skippedCount = 0;
  const result: Note[] = [];

  for (const note of notes) {
    const parsed = parsePitch(note.pitch);
    if (!parsed) {
      skippedCount++;
      continue;
    }

    // Check if the pitch letter is available at all
    if (!availableLetters.has(parsed.letter)) {
      // Try enharmonic equivalents (e.g., C# vs Db)
      const enharmonic = getEnharmonic(parsed.letter);
      if (enharmonic && availableLetters.has(enharmonic)) {
        // Use enharmonic equivalent
        const targetOctave = clampOctave(parsed.octave, minOctave, maxOctave);
        const transposedPitch = `${enharmonic}${targetOctave}`;
        if (availableNotes.includes(transposedPitch)) {
          result.push({ ...note, pitch: transposedPitch, timingPosition: BigInt(result.length) });
          if (targetOctave !== parsed.octave || enharmonic !== parsed.letter) transposedCount++;
          continue;
        }
      }
      skippedCount++;
      continue;
    }

    // Pitch letter is available; check if octave needs adjustment
    const targetOctave = clampOctave(parsed.octave, minOctave, maxOctave);
    const targetPitch = `${parsed.letter}${targetOctave}`;

    if (availableNotes.includes(targetPitch)) {
      result.push({ ...note, pitch: targetPitch, timingPosition: BigInt(result.length) });
      if (targetOctave !== parsed.octave) transposedCount++;
    } else {
      // Try adjacent octaves
      let found = false;
      for (let delta = 1; delta <= 3; delta++) {
        for (const dir of [1, -1]) {
          const tryOctave = targetOctave + dir * delta;
          const tryPitch = `${parsed.letter}${tryOctave}`;
          if (availableNotes.includes(tryPitch)) {
            result.push({ ...note, pitch: tryPitch, timingPosition: BigInt(result.length) });
            transposedCount++;
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found) skippedCount++;
    }
  }

  return {
    notes: result,
    totalImported: result.length,
    transposedCount,
    skippedCount,
  };
}

function clampOctave(octave: number, min: number, max: number): number {
  if (octave < min) return min;
  if (octave > max) return max;
  return octave;
}

function getEnharmonic(letter: string): string | null {
  const map: Record<string, string> = {
    'C#': 'Db', 'Db': 'C#',
    'D#': 'Eb', 'Eb': 'D#',
    'F#': 'Gb', 'Gb': 'F#',
    'G#': 'Ab', 'Ab': 'G#',
    'A#': 'Bb', 'Bb': 'A#',
  };
  return map[letter] ?? null;
}
