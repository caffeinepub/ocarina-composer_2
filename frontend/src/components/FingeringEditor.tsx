import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, RotateCcw, Save, X, Check } from 'lucide-react';
import { getHoleLayout } from '../utils/holeLayout';
import type { FingeringChart, FingeringPattern, HoleId } from '../types/fingering';
import { NOTE_NAMES } from '../types/fingering';
import type { HoleShape } from '../types/shapes';
import { toast } from 'sonner';

interface FingeringEditorProps {
  fingeringChart: FingeringChart;
  holeShape: HoleShape;
  onUpdatePattern: (note: string, pattern: FingeringPattern) => void;
  onReset: () => void;
  /** Optional: called when user saves a named custom preset */
  onSavePreset?: (name: string, chart: FingeringChart) => void;
}

const DEFAULT_PATTERN: FingeringPattern = {
  leftIndex: false,
  leftMiddle: false,
  rightIndex: false,
  rightMiddle: false,
};

const getHoleShapeClass = (shape: HoleShape) => {
  switch (shape) {
    case 'oval':   return 'rounded-full';
    case 'square': return 'rounded-sm';
    default:       return 'rounded-full';
  }
};

const getHoleSize = (shape: HoleShape) => {
  switch (shape) {
    case 'oval':   return { width: 56, height: 80 };
    case 'square': return { width: 64, height: 64 };
    default:       return { width: 64, height: 64 };
  }
};

export default function FingeringEditor({
  fingeringChart,
  holeShape,
  onUpdatePattern,
  onReset,
  onSavePreset,
}: FingeringEditorProps) {
  const [selectedNote, setSelectedNote] = useState<string>('C5');
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [presetName, setPresetName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  const currentPattern: FingeringPattern = fingeringChart[selectedNote] || DEFAULT_PATTERN;

  const toggleHole = (holeId: HoleId) => {
    const newPattern: FingeringPattern = {
      ...currentPattern,
      [holeId]: !currentPattern[holeId],
    };
    onUpdatePattern(selectedNote, newPattern);
  };

  const handleInitiateSave = () => {
    setShowSaveInput(true);
    setPresetName('');
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const handleCancelSave = () => {
    setShowSaveInput(false);
    setPresetName('');
  };

  const handleConfirmSave = () => {
    const name = presetName.trim();
    if (!name) {
      toast.error('Please enter a preset name');
      nameInputRef.current?.focus();
      return;
    }
    if (name.toLowerCase() === 'synth') {
      toast.error('"Synth" is a reserved preset name');
      return;
    }
    onSavePreset?.(name, fingeringChart);
    setShowSaveInput(false);
    setPresetName('');
    toast.success(`Fingering preset "${name}" saved`);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleConfirmSave();
    if (e.key === 'Escape') handleCancelSave();
  };

  const holeSize = getHoleSize(holeShape);
  const layout = getHoleLayout('round');

  const scale = 0.6;
  const containerWidth = 384 * scale;
  const containerHeight = 224 * scale;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configure Fingering
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Fingering Configuration</DialogTitle>
          <DialogDescription>
            Click on holes to toggle them between covered (filled) and open (empty) for each note.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Note selector */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Select Note</h3>
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-3 gap-2">
                {NOTE_NAMES.map((note) => (
                  <Button
                    key={note}
                    variant={selectedNote === note ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedNote(note)}
                    className="w-full"
                  >
                    {note}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Fingering editor */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Fingering for {selectedNote}</h3>
              <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
                <RotateCcw className="w-3 h-3" />
                Reset All
              </Button>
            </div>

            <div className="bg-muted rounded-lg p-6 flex items-center justify-center">
              <div
                className="relative bg-background rounded-full border-4 border-border"
                style={{ width: `${containerWidth}px`, height: `${containerHeight}px` }}
              >
                {(['leftIndex', 'leftMiddle', 'rightIndex', 'rightMiddle'] as const).map((holeId) => {
                  const pos = layout[holeId];
                  const isCovered = currentPattern[holeId];
                  return (
                    <button
                      key={holeId}
                      onClick={() => toggleHole(holeId)}
                      className={cn(
                        getHoleShapeClass(holeShape),
                        'absolute border-4 transition-all duration-200 cursor-pointer',
                        'hover:scale-110 hover:shadow-lg active:scale-95'
                      )}
                      style={{
                        width: `${holeSize.width}px`,
                        height: `${holeSize.height}px`,
                        left: `${pos.x * scale}px`,
                        top: `${pos.y * scale}px`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: isCovered ? 'hsl(var(--primary))' : 'white',
                        borderColor: 'hsl(var(--border))',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              <p>• Click holes to toggle between covered (filled) and open (empty)</p>
              <p>• Covered holes are shown in color</p>
              <p>• Open holes are shown as white circles</p>
            </div>

            {/* Inline Save as Preset */}
            {onSavePreset && (
              <div className="mt-4 border-t border-border pt-4 space-y-2">
                <p className="text-xs font-semibold text-foreground">Save as Custom Preset</p>
                {showSaveInput ? (
                  <div className="flex gap-2 items-center">
                    <Input
                      ref={nameInputRef}
                      placeholder="Enter preset name…"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      onKeyDown={handleNameKeyDown}
                      className="h-8 text-sm flex-1"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleConfirmSave}
                      disabled={!presetName.trim()}
                      className="h-8 gap-1"
                      title="Confirm save"
                    >
                      <Check className="w-3 h-3" /> Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelSave}
                      className="h-8"
                      title="Cancel"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleInitiateSave}
                    className="h-8 gap-1"
                  >
                    <Save className="w-3 h-3" /> Save Fingering as Preset
                  </Button>
                )}
                {showSaveInput && (
                  <p className="text-xs text-muted-foreground">
                    Name your custom fingering preset. Press Enter or click Save to confirm.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
