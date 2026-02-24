import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, Trash2 } from 'lucide-react';
import type { Note } from '../backend';
import { useSampleAssignments } from '../hooks/useSampleAssignments';
import { useSamplePresets, SYNTH_PRESET } from '../hooks/useSamplePresets';

// Frequency map for all notes across C4–C7
const NOTE_FREQUENCIES: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
  G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, F6: 1396.91,
  G6: 1567.98, A6: 1760.00, B6: 1975.53,
  C7: 2093.00,
};

const DURATION_SECONDS: Record<string, number> = {
  whole: 2.0,
  half: 1.0,
  quarter: 0.5,
  eighth: 0.25,
  sixteenth: 0.125,
};

interface CompositionControlsProps {
  notes: Note[];
  selectedDuration: string;
  onDurationChange: (duration: string) => void;
  onClear: () => void;
}

export default function CompositionControls({
  notes,
  selectedDuration,
  onDurationChange,
  onClear,
}: CompositionControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const stopRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const { getSample } = useSampleAssignments();
  const { activePreset } = useSamplePresets();

  const durations = ['whole', 'half', 'quarter', 'eighth', 'sixteenth'];

  const playSynthNote = (
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number
  ) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // ADSR envelope
    const attack = 0.02;
    const decay = 0.1;
    const sustain = 0.7;
    const release = 0.1;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.8, startTime + attack);
    gainNode.gain.linearRampToValueAtTime(sustain * 0.8, startTime + attack + decay);
    gainNode.gain.setValueAtTime(sustain * 0.8, startTime + duration - release);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  const playSampleNote = (dataUrl: string, startTime: number, duration: number, ctx: AudioContext) => {
    // Schedule sample playback using AudioContext
    fetch(dataUrl)
      .then((r) => r.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        const gainNode = ctx.createGain();
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(1, startTime);
        gainNode.gain.setValueAtTime(1, startTime + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        source.start(startTime);
        source.stop(startTime + duration);
      })
      .catch(() => {
        // Fallback: ignore decode errors
      });
  };

  const handlePlay = async () => {
    if (notes.length === 0) return;
    setIsPlaying(true);
    stopRef.current = false;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    let currentTime = ctx.currentTime + 0.1;

    for (const note of notes) {
      if (stopRef.current) break;
      const duration = DURATION_SECONDS[note.duration] ?? 0.5;
      const pitch = note.pitch;

      const sampleDataUrl = activePreset !== SYNTH_PRESET ? getSample(pitch) : undefined;

      if (sampleDataUrl) {
        playSampleNote(sampleDataUrl, currentTime, duration, ctx);
      } else {
        const frequency = NOTE_FREQUENCIES[pitch] ?? 523.25;
        playSynthNote(ctx, frequency, currentTime, duration);
      }

      currentTime += duration;
    }

    // Wait for playback to finish
    const totalDuration = notes.reduce(
      (sum, n) => sum + (DURATION_SECONDS[n.duration] ?? 0.5),
      0
    );
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        resolve();
      }, (totalDuration + 0.2) * 1000);
      // Allow early stop
      const check = setInterval(() => {
        if (stopRef.current) {
          clearTimeout(timeout);
          clearInterval(check);
          resolve();
        }
      }, 100);
    });

    ctx.close();
    setIsPlaying(false);
  };

  const handleStop = () => {
    stopRef.current = true;
    audioCtxRef.current?.close();
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Duration Selector */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Note Duration
        </span>
        <div className="flex rounded-lg overflow-hidden border border-border">
          {durations.map((d) => (
            <button
              key={d}
              onClick={() => onDurationChange(d)}
              className={`flex-1 py-1.5 text-xs font-medium transition-colors capitalize ${
                selectedDuration === d
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex gap-2">
        {isPlaying ? (
          <Button variant="outline" size="sm" onClick={handleStop} className="gap-1.5">
            <Square className="w-3.5 h-3.5" /> Stop
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handlePlay}
            disabled={notes.length === 0}
            className="gap-1.5"
          >
            <Play className="w-3.5 h-3.5" /> Play
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={notes.length === 0}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </Button>
      </div>
    </div>
  );
}
