import type { Note } from '../backend';

interface ParsedNote {
  pitch: string;
  duration: string;
}

const DURATION_MAP: Record<string, string> = {
  '1024th': 'sixteenth',
  '512th': 'sixteenth',
  '256th': 'sixteenth',
  '128th': 'sixteenth',
  '64th': 'sixteenth',
  '32nd': 'sixteenth',
  '16th': 'sixteenth',
  eighth: 'eighth',
  quarter: 'quarter',
  half: 'half',
  whole: 'whole',
  breve: 'whole',
  long: 'whole',
  maxima: 'whole',
};

export function parseMusicXML(xmlText: string): Note[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid MusicXML file: ' + parseError.textContent?.slice(0, 100));
  }

  const noteElements = doc.querySelectorAll('note');
  if (noteElements.length === 0) {
    throw new Error('No notes found in MusicXML file');
  }

  const parsed: ParsedNote[] = [];

  noteElements.forEach((noteEl) => {
    // Skip rests
    if (noteEl.querySelector('rest')) return;
    // Skip chord duplicates (only take the first note of a chord)
    if (noteEl.querySelector('chord')) return;

    const stepEl = noteEl.querySelector('pitch > step');
    const octaveEl = noteEl.querySelector('pitch > octave');
    const alterEl = noteEl.querySelector('pitch > alter');
    const typeEl = noteEl.querySelector('type');

    if (!stepEl || !octaveEl) return;

    const step = stepEl.textContent?.trim() ?? '';
    const octave = octaveEl.textContent?.trim() ?? '';
    const alter = alterEl ? parseFloat(alterEl.textContent ?? '0') : 0;

    let pitchName = step;
    if (alter === 1) pitchName += '#';
    else if (alter === -1) pitchName += 'b';

    const pitch = `${pitchName}${octave}`;

    const typeText = typeEl?.textContent?.trim() ?? 'quarter';
    const duration = DURATION_MAP[typeText] ?? 'quarter';

    parsed.push({ pitch, duration });
  });

  if (parsed.length === 0) {
    throw new Error('No pitched notes found in MusicXML file');
  }

  return parsed.map((n, i) => ({
    pitch: n.pitch,
    duration: n.duration,
    timingPosition: BigInt(i),
  }));
}
