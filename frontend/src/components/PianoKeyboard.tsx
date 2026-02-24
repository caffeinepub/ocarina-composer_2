import React, { useState, useEffect } from 'react';
import { OcarinaSizePreset, getNotesForPreset } from '../types/fingering';

const STORAGE_KEY = 'ocarinaSizePreset';

function getSavedPreset(): OcarinaSizePreset {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'Small' || stored === 'Medium' || stored === 'Large') return stored;
  return 'Medium';
}

interface PianoKeyboardProps {
  onNoteSelect: (note: string) => void;
}

// White key note names within an octave (no sharps/flats for 4-hole ocarina)
const WHITE_NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export default function PianoKeyboard({ onNoteSelect }: PianoKeyboardProps) {
  const [preset, setPreset] = useState<OcarinaSizePreset>(getSavedPreset);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as OcarinaSizePreset;
      setPreset(detail);
    };
    window.addEventListener('ocarinaSizeChanged', handler);
    return () => window.removeEventListener('ocarinaSizeChanged', handler);
  }, []);

  const notes = getNotesForPreset(preset);

  // Separate white and black keys — for 4-hole ocarina we only have natural notes
  const whiteNotes = notes.filter((n) => !n.includes('#'));

  const handlePresetChange = (p: OcarinaSizePreset) => {
    localStorage.setItem(STORAGE_KEY, p);
    setPreset(p);
    window.dispatchEvent(new CustomEvent('ocarinaSizeChanged', { detail: p }));
  };

  const presetLabels: Record<OcarinaSizePreset, string> = {
    Small: 'Small (High)',
    Medium: 'Medium',
    Large: 'Large (Low)',
  };

  const octaveLabel: Record<OcarinaSizePreset, string> = {
    Small: 'C6–C7',
    Medium: 'C5–C6',
    Large: 'C4–C5',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Ocarina Size Preset Selector */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Ocarina Size
        </span>
        <div className="flex rounded-lg overflow-hidden border border-border">
          {(['Small', 'Medium', 'Large'] as OcarinaSizePreset[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePresetChange(p)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                preset === p
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {presetLabels[p]}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{octaveLabel[preset]}</span>
      </div>

      {/* Piano Keys */}
      <div className="relative flex" style={{ height: '100px' }}>
        {whiteNotes.map((note, i) => (
          <button
            key={note}
            onClick={() => onNoteSelect(note)}
            className="relative border border-border bg-white hover:bg-amber-50 active:bg-amber-100 transition-colors rounded-b-md shadow-sm"
            style={{ width: '44px', height: '100px', marginRight: '2px' }}
            title={note}
          >
            <span className="absolute bottom-2 left-0 right-0 text-center text-xs font-medium text-stone-600">
              {note}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
