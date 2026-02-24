import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Note } from '../App';

interface CompositionControlsProps {
  notes: Note[];
  currentDuration: Note['duration'];
  onDurationChange: (duration: Note['duration']) => void;
  isPlaying: boolean;
  onPlayToggle: (playing: boolean) => void;
  onClear: () => void;
  onPlayingIndexChange: (index: number | null) => void;
}

const durationLabels: Record<Note['duration'], string> = {
  whole: 'Whole Note (𝅝)',
  half: 'Half Note (𝅗𝅥)',
  quarter: 'Quarter Note (♩)',
  eighth: 'Eighth Note (♪)',
};

const durationMs: Record<Note['duration'], number> = {
  whole: 2000,
  half: 1000,
  quarter: 500,
  eighth: 250,
};

// Note frequencies for ocarina sound
const noteFrequencies: Record<string, number> = {
  'C': 261.63,
  'C#': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'B': 493.88,
  'C6': 1046.50, // One octave higher than C5
};

export default function CompositionControls({
  notes,
  currentDuration,
  onDurationChange,
  isPlaying,
  onPlayToggle,
  onClear,
  onPlayingIndexChange,
}: CompositionControlsProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize Web Audio API
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
    };
  }, []);

  const playNote = (pitch: string, duration: number) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    const frequency = noteFrequencies[pitch];
    if (!frequency) return;

    // Create oscillator for ocarina-like sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine'; // Sine wave for flute-like sound
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // ADSR envelope for more natural sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05); // Attack
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1); // Decay
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + duration / 1000 - 0.1); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000); // Release

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  };

  const playComposition = async () => {
    if (notes.length === 0) return;

    onPlayToggle(true);
    
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      onPlayingIndexChange(i);
      
      const duration = durationMs[note.duration];
      playNote(note.pitch, duration);
      
      await new Promise(resolve => {
        playbackTimeoutRef.current = setTimeout(resolve, duration);
      });
    }

    onPlayingIndexChange(null);
    onPlayToggle(false);
  };

  const stopPlayback = () => {
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
    }
    onPlayingIndexChange(null);
    onPlayToggle(false);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Composition Controls</h2>
      
      <div className="flex flex-wrap gap-4 items-end">
        {/* Note Duration Selector */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Note Duration
          </label>
          <Select
            value={currentDuration}
            onValueChange={(value) => onDurationChange(value as Note['duration'])}
            disabled={isPlaying}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(durationLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Playback Controls */}
        <div className="flex gap-2">
          <Button
            onClick={isPlaying ? stopPlayback : playComposition}
            disabled={notes.length === 0}
            className="gap-2"
            variant={isPlaying ? 'secondary' : 'default'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play
              </>
            )}
          </Button>

          <Button
            onClick={onClear}
            disabled={notes.length === 0 || isPlaying}
            variant="outline"
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Composition Stats */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex gap-6 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Notes:</span> {notes.length}
          </div>
          <div>
            <span className="font-medium text-foreground">Duration:</span>{' '}
            {(notes.reduce((sum, note) => sum + durationMs[note.duration], 0) / 1000).toFixed(1)}s
          </div>
        </div>
      </div>
    </div>
  );
}
