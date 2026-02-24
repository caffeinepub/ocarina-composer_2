import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OcarinaTablature from './OcarinaTablature';
import type { HoleShape } from '../types/shapes';
import type { FingeringChart } from '../types/fingering';
import type { Note } from '../backend';

interface SheetMusicProps {
  notes: Note[];
  lyrics: string;
  selectedNoteIndex: number | null;
  onNoteSelect: (index: number) => void;
  onNoteDelete: (index: number) => void;
  onLyricsChange: (lyrics: string) => void;
  currentPlayingIndex?: number | null;
  holeShape?: HoleShape;
  fingeringChart?: FingeringChart;
}

const getDurationSymbol = (duration: string) => {
  switch (duration) {
    case 'whole':     return '𝅝';
    case 'half':      return '𝅗𝅥';
    case 'quarter':   return '♩';
    case 'eighth':    return '♪';
    case 'sixteenth': return '𝅘𝅥𝅯';
    default:          return '♩';
  }
};

export default function SheetMusic({
  notes,
  lyrics,
  selectedNoteIndex,
  onNoteSelect,
  onNoteDelete,
  onLyricsChange,
  currentPlayingIndex = null,
  holeShape = 'round',
  fingeringChart,
}: SheetMusicProps) {
  const [editingLyrics, setEditingLyrics] = useState(false);

  return (
    <div className="space-y-4">
      {notes.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-base">No notes yet</p>
          <p className="text-sm mt-1">Click piano keys below to start composing</p>
        </div>
      ) : (
        <div className="relative bg-background rounded-lg p-4 border border-border overflow-x-auto">
          <div className="flex gap-4 items-end min-h-[120px]">
            {notes.map((note, index) => (
              <div
                key={index}
                className={cn(
                  'relative flex flex-col items-center cursor-pointer transition-all group flex-shrink-0',
                  selectedNoteIndex === index && 'scale-110',
                  currentPlayingIndex === index && 'animate-pulse'
                )}
                onClick={() => onNoteSelect(index)}
              >
                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  onClick={(e) => { e.stopPropagation(); onNoteDelete(index); }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>

                {/* Note symbol */}
                <div
                  className={cn(
                    'text-4xl font-bold transition-colors',
                    currentPlayingIndex === index ? 'text-primary'
                      : selectedNoteIndex === index ? 'text-accent'
                      : 'text-foreground'
                  )}
                >
                  {getDurationSymbol(note.duration)}
                </div>

                {/* Note name */}
                <div className="text-xs font-semibold text-muted-foreground mt-1">{note.pitch}</div>

                {/* Tablature */}
                <div className="mt-1">
                  <OcarinaTablature pitch={note.pitch} holeShape={holeShape} fingeringChart={fingeringChart} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lyrics */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lyrics</span>
          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setEditingLyrics((v) => !v)}
          >
            {editingLyrics ? 'Done' : 'Edit'}
          </button>
        </div>
        {editingLyrics ? (
          <textarea
            value={lyrics}
            onChange={(e) => onLyricsChange(e.target.value)}
            placeholder="Add lyrics here..."
            rows={3}
            className="w-full text-sm border border-border rounded-md p-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[2rem]">
            {lyrics || <span className="italic opacity-50">No lyrics yet — click Edit to add</span>}
          </p>
        )}
      </div>
    </div>
  );
}
