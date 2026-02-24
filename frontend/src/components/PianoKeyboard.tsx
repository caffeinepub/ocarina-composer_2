import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PianoKeyboardProps {
  onNoteClick: (pitch: string) => void;
  disabled?: boolean;
}

const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C6'];
const blackKeys = ['C#', 'D#', null, 'F#', 'G#', 'A#', null];

export default function PianoKeyboard({ onNoteClick, disabled }: PianoKeyboardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Piano Keyboard</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Click keys to add notes to your composition
      </p>
      
      <div className="relative inline-block">
        {/* White keys */}
        <div className="flex gap-0.5">
          {whiteKeys.map((note) => (
            <Button
              key={note}
              onClick={() => onNoteClick(note)}
              disabled={disabled}
              className={cn(
                'w-16 h-48 rounded-b-lg border-2 border-gray-300 bg-white hover:bg-gray-100',
                'text-gray-800 font-semibold shadow-md transition-all',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'active:translate-y-1 active:shadow-sm'
              )}
              variant="outline"
            >
              <span className="mt-auto">{note}</span>
            </Button>
          ))}
        </div>

        {/* Black keys */}
        <div className="absolute top-0 left-0 flex pointer-events-none">
          {blackKeys.map((note, index) => (
            <div key={index} className="w-16 flex justify-end pr-2">
              {note && (
                <Button
                  onClick={() => onNoteClick(note)}
                  disabled={disabled}
                  className={cn(
                    'w-10 h-28 rounded-b-md bg-gray-900 hover:bg-gray-700 border-2 border-gray-800',
                    'text-white text-xs font-semibold shadow-lg pointer-events-auto',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'active:translate-y-1 active:shadow-sm z-10'
                  )}
                  variant="outline"
                >
                  <span className="mt-auto">{note}</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
