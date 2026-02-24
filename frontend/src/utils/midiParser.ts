import type { Note } from '../backend';

const MIDI_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiNoteToName(midiNote: number): string {
  const octave = Math.floor(midiNote / 12) - 1;
  const name = MIDI_NOTE_NAMES[midiNote % 12];
  return `${name}${octave}`;
}

function ticksToDuration(ticks: number, ticksPerBeat: number): string {
  const beats = ticks / ticksPerBeat;
  if (beats >= 3.5) return 'whole';
  if (beats >= 1.75) return 'half';
  if (beats >= 0.875) return 'quarter';
  if (beats >= 0.4375) return 'eighth';
  return 'sixteenth';
}

interface MidiNoteEvent {
  note: number;
  startTick: number;
  endTick: number;
}

export function parseMIDI(buffer: ArrayBuffer): Note[] {
  const view = new DataView(buffer);
  let offset = 0;

  const readUint32 = () => {
    const val = view.getUint32(offset);
    offset += 4;
    return val;
  };

  const readUint16 = () => {
    const val = view.getUint16(offset);
    offset += 2;
    return val;
  };

  const readUint8 = () => {
    const val = view.getUint8(offset);
    offset += 1;
    return val;
  };

  const readVarLen = (): number => {
    let value = 0;
    let byte: number;
    do {
      byte = readUint8();
      value = (value << 7) | (byte & 0x7f);
    } while (byte & 0x80);
    return value;
  };

  // Read MIDI header
  const headerMagic = readUint32();
  if (headerMagic !== 0x4d546864) {
    throw new Error('Not a valid MIDI file (missing MThd header)');
  }

  const headerLength = readUint32();
  if (headerLength < 6) throw new Error('Invalid MIDI header length');

  const format = readUint16();
  const numTracks = readUint16();
  const ticksPerBeat = readUint16();

  if (ticksPerBeat & 0x8000) {
    throw new Error('SMPTE timecode MIDI files are not supported');
  }

  // Skip extra header bytes if any
  offset += headerLength - 6;

  // Parse tracks — collect all note events from all tracks
  const allNoteEvents: MidiNoteEvent[] = [];
  let bestTrackEvents: MidiNoteEvent[] = [];
  let bestTrackNoteCount = 0;

  for (let t = 0; t < numTracks; t++) {
    if (offset + 8 > buffer.byteLength) break;

    const trackMagic = readUint32();
    const trackLength = readUint32();
    const trackEnd = offset + trackLength;

    if (trackMagic !== 0x4d54726b) {
      offset = trackEnd;
      continue;
    }

    let currentTick = 0;
    const activeNotes = new Map<number, number>(); // note -> startTick
    const trackNotes: MidiNoteEvent[] = [];
    let lastStatus = 0;

    while (offset < trackEnd) {
      const delta = readVarLen();
      currentTick += delta;

      let statusByte = view.getUint8(offset);

      // Running status
      if (statusByte & 0x80) {
        lastStatus = statusByte;
        offset++;
      } else {
        statusByte = lastStatus;
      }

      const type = (statusByte & 0xf0) >> 4;
      const channel = statusByte & 0x0f;

      if (type === 0x9) {
        // Note On
        const note = readUint8();
        const velocity = readUint8();
        if (velocity > 0) {
          activeNotes.set(note, currentTick);
        } else {
          // velocity 0 = note off
          const startTick = activeNotes.get(note);
          if (startTick !== undefined) {
            trackNotes.push({ note, startTick, endTick: currentTick });
            activeNotes.delete(note);
          }
        }
      } else if (type === 0x8) {
        // Note Off
        const note = readUint8();
        readUint8(); // velocity
        const startTick = activeNotes.get(note);
        if (startTick !== undefined) {
          trackNotes.push({ note, startTick, endTick: currentTick });
          activeNotes.delete(note);
        }
      } else if (type === 0xa) {
        // Aftertouch
        offset += 2;
      } else if (type === 0xb) {
        // Control Change
        offset += 2;
      } else if (type === 0xc) {
        // Program Change
        offset += 1;
      } else if (type === 0xd) {
        // Channel Pressure
        offset += 1;
      } else if (type === 0xe) {
        // Pitch Bend
        offset += 2;
      } else if (statusByte === 0xff) {
        // Meta event
        const metaType = readUint8();
        const metaLength = readVarLen();
        offset += metaLength;
      } else if (statusByte === 0xf0 || statusByte === 0xf7) {
        // SysEx
        const sysexLength = readVarLen();
        offset += sysexLength;
      } else {
        // Unknown, skip
        offset++;
      }
    }

    offset = trackEnd;

    if (trackNotes.length > bestTrackNoteCount) {
      bestTrackNoteCount = trackNotes.length;
      bestTrackEvents = trackNotes;
    }
  }

  if (bestTrackEvents.length === 0) {
    throw new Error('No notes found in MIDI file');
  }

  // Sort by start tick
  bestTrackEvents.sort((a, b) => a.startTick - b.startTick);

  // Convert to app Note format
  return bestTrackEvents.map((ev, i) => ({
    pitch: midiNoteToName(ev.note),
    duration: ticksToDuration(ev.endTick - ev.startTick, ticksPerBeat),
    timingPosition: BigInt(i),
  }));
}
