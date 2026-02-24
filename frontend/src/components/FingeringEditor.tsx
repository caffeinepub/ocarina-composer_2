import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, RotateCcw } from 'lucide-react';
import { getHoleLayout } from '../utils/holeLayout';
import type { FingeringChart, FingeringPattern, HoleId } from '../types/fingering';
import type { HoleShape, BodyShape } from '../App';
import { NOTE_NAMES } from '../types/fingering';

interface FingeringEditorProps {
  fingeringChart: FingeringChart;
  holeShape: HoleShape;
  bodyShape?: BodyShape;
  onUpdatePattern: (note: string, pattern: FingeringPattern) => void;
  onReset: () => void;
}

export default function FingeringEditor({
  fingeringChart,
  holeShape,
  bodyShape = 'round',
  onUpdatePattern,
  onReset,
}: FingeringEditorProps) {
  const [selectedNote, setSelectedNote] = useState<string>('C');
  const [isOpen, setIsOpen] = useState(false);

  const currentPattern = fingeringChart[selectedNote] || {
    leftIndex: false,
    leftMiddle: false,
    rightIndex: false,
    rightMiddle: false,
  };

  const toggleHole = (holeId: HoleId) => {
    const newPattern = {
      ...currentPattern,
      [holeId]: !currentPattern[holeId],
    };
    onUpdatePattern(selectedNote, newPattern);
  };

  const getHoleShapeClass = (shape: HoleShape) => {
    switch (shape) {
      case 'round':
        return 'rounded-full';
      case 'oval':
        return 'rounded-full';
      case 'square':
        return 'rounded-sm';
    }
  };

  const getHoleSize = (shape: HoleShape) => {
    switch (shape) {
      case 'round':
        return { width: 64, height: 64 };
      case 'oval':
        return { width: 56, height: 80 };
      case 'square':
        return { width: 64, height: 64 };
    }
  };

  const holeSize = getHoleSize(holeShape);
  const layout = getHoleLayout(bodyShape);

  // Scale positions for editor (smaller container)
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
            The key note (all holes closed) is C by default. C6 is one octave higher with all holes open.
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
              <h3 className="text-sm font-semibold">
                Fingering for {selectedNote}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All
              </Button>
            </div>

            {/* Visual editor */}
            <div className="bg-muted rounded-lg p-6 flex items-center justify-center">
              <div
                className="relative bg-background rounded-full border-4 border-border"
                style={{
                  width: `${containerWidth}px`,
                  height: `${containerHeight}px`,
                }}
              >
                {/* Holes */}
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

            {/* Instructions */}
            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              <p>• Click holes to toggle between covered (filled) and open (empty)</p>
              <p>• Covered holes are shown in color</p>
              <p>• Open holes are shown as white circles</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
