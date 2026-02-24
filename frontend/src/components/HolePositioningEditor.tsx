import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { HoleShape } from '../App';
import type { HoleLayout } from '../utils/holeLayout';

interface HolePositioningEditorProps {
  photoUrl: string;
  holeShape: HoleShape;
  positions: HoleLayout;
  onPositionChange: (holeId: keyof HoleLayout, x: number, y: number) => void;
  onReset: () => void;
}

type HoleId = keyof HoleLayout;

export default function HolePositioningEditor({
  photoUrl,
  holeShape,
  positions,
  onPositionChange,
  onReset,
}: HolePositioningEditorProps) {
  const [draggingHole, setDraggingHole] = useState<HoleId | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        return { width: 48, height: 48 };
      case 'oval':
        return { width: 40, height: 56 };
      case 'square':
        return { width: 48, height: 48 };
    }
  };

  const holeSize = getHoleSize(holeShape);

  const updatePosition = (clientX: number, clientY: number) => {
    if (!draggingHole || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Clamp to container bounds
    const clampedX = Math.max(holeSize.width / 2, Math.min(x, rect.width - holeSize.width / 2));
    const clampedY = Math.max(holeSize.height / 2, Math.min(y, rect.height - holeSize.height / 2));

    onPositionChange(draggingHole, clampedX, clampedY);
    setHasUnsavedChanges(true);
  };

  // Mouse event handlers
  const handleMouseDown = (holeId: HoleId) => {
    setDraggingHole(holeId);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingHole) return;
    updatePosition(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setDraggingHole(null);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, holeId: HoleId) => {
    e.preventDefault(); // Prevent scrolling
    setDraggingHole(holeId);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggingHole) return;
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    if (touch) {
      updatePosition(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggingHole(null);
  };

  useEffect(() => {
    if (draggingHole) {
      const handleGlobalMouseUp = () => setDraggingHole(null);
      const handleGlobalTouchEnd = () => setDraggingHole(null);
      
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchend', handleGlobalTouchEnd);
      
      return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [draggingHole]);

  const handleSave = () => {
    // Positions are already saved to localStorage via onPositionChange
    setHasUnsavedChanges(false);
    toast.success('Hole positions saved!');
  };

  const handleResetClick = () => {
    onReset();
    setHasUnsavedChanges(false);
    toast.success('Positions reset to default');
  };

  const holeLabels: Record<HoleId, string> = {
    leftIndex: 'Left Index',
    leftMiddle: 'Left Middle',
    rightIndex: 'Right Index',
    rightMiddle: 'Right Middle',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Position Holes on Photo</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Drag each hole to match your ocarina's layout
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleResetClick}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button 
            variant={hasUnsavedChanges ? "default" : "outline"} 
            size="sm" 
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-96 h-56 bg-muted rounded-lg overflow-hidden cursor-crosshair border-2 border-border touch-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          backgroundImage: `url(${photoUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Holes */}
        {(['leftIndex', 'leftMiddle', 'rightIndex', 'rightMiddle'] as const).map((holeId) => {
          const pos = positions[holeId];
          const isDragging = draggingHole === holeId;

          return (
            <div
              key={holeId}
              className={cn(
                getHoleShapeClass(holeShape),
                'absolute border-4 transition-all cursor-move touch-none',
                isDragging && 'ring-4 ring-primary ring-opacity-50 scale-110 z-10'
              )}
              style={{
                width: `${holeSize.width}px`,
                height: `${holeSize.height}px`,
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                borderColor: isDragging ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
              }}
              onMouseDown={() => handleMouseDown(holeId)}
              onTouchStart={(e) => handleTouchStart(e, holeId)}
            >
              {/* Label */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap bg-background px-2 py-1 rounded shadow-sm border border-border">
                {holeLabels[holeId]}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {draggingHole ? `Moving ${holeLabels[draggingHole]}...` : 'Click or tap and drag holes to reposition'}
      </p>
    </div>
  );
}
