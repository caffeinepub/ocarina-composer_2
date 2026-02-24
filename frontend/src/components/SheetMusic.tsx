import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OcarinaTablature from './OcarinaTablature';
import type { Note, HoleShape } from '../App';
import type { FingeringChart } from '../types/fingering';

interface SheetMusicProps {
  notes: Note[];
  selectedNoteIndex: number | null;
  onNoteSelect: (index: number) => void;
  onNoteDelete: (index: number) => void;
  onLyricsUpdate: (index: number, lyrics: string) => void;
  currentPlayingIndex: number | null;
  holeShape: HoleShape;
  fingeringChart?: FingeringChart;
}

export default function SheetMusic({
  notes,
  selectedNoteIndex,
  onNoteSelect,
  onNoteDelete,
  onLyricsUpdate,
  currentPlayingIndex,
  holeShape,
  fingeringChart,
}: SheetMusicProps) {
  const [editingLyricsIndex, setEditingLyricsIndex] = useState<number | null>(null);

  const getDurationSymbol = (duration: Note['duration']) => {
    switch (duration) {
      case 'whole':
        return '𝅝';
      case 'half':
        return '𝅗𝅥';
      case 'quarter':
        return '♩';
      case 'eighth':
        return '♪';
    }
  };

  const handleLyricsClick = (index: number) => {
    setEditingLyricsIndex(index);
  };

  const handleLyricsBlur = () => {
    setEditingLyricsIndex(null);
  };

  const handleLyricsChange = (index: number, value: string) => {
    onLyricsUpdate(index, value);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Sheet Music</h2>
      
      {notes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No notes yet</p>
          <p className="text-sm mt-2">Click on the piano keys below to start composing</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Staff lines */}
          <div className="relative bg-background rounded-lg p-6 border border-border">
            <div className="flex flex-wrap gap-6 items-end min-h-[120px]">
              {notes.map((note, index) => (
                <div
                  key={index}
                  className={cn(
                    'relative flex flex-col items-center cursor-pointer transition-all group',
                    selectedNoteIndex === index && 'scale-110',
                    currentPlayingIndex === index && 'animate-pulse'
                  )}
                  onClick={() => onNoteSelect(index)}
                >
                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNoteDelete(index);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>

                  {/* Note symbol */}
                  <div
                    className={cn(
                      'text-5xl font-bold transition-colors',
                      currentPlayingIndex === index
                        ? 'text-primary'
                        : selectedNoteIndex === index
                        ? 'text-accent'
                        : 'text-foreground'
                    )}
                  >
                    {getDurationSymbol(note.duration)}
                  </div>

                  {/* Note name */}
                  <div className="text-sm font-semibold text-muted-foreground mt-1">
                    {note.pitch}
                  </div>

                  {/* Ocarina tablature */}
                  <div className="mt-2">
                    <OcarinaTablature pitch={note.pitch} holeShape={holeShape} fingeringChart={fingeringChart} />
                  </div>

                  {/* Lyrics */}
                  <div className="mt-2 w-20">
                    {editingLyricsIndex === index ? (
                      <Input
                        type="text"
                        value={note.lyrics || ''}
                        onChange={(e) => handleLyricsChange(index, e.target.value)}
                        onBlur={handleLyricsBlur}
                        autoFocus
                        className="h-7 text-xs text-center"
                        placeholder="lyrics"
                      />
                    ) : (
                      <div
                        className="text-xs text-center min-h-[20px] px-1 py-0.5 rounded transition-colors flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLyricsClick(index);
                        }}
                      >
                        {note.lyrics ? (
                          <span className="text-muted-foreground hover:text-foreground cursor-text">
                            {note.lyrics}
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 hover:bg-muted/50"
                          >
                            <Plus className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-2xl">𝅝</span>
              <span>Whole</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">𝅗𝅥</span>
              <span>Half</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">♩</span>
              <span>Quarter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">♪</span>
              <span>Eighth</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
