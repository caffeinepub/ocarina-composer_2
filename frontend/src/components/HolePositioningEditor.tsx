import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RotateCcw, Save, X, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import type { HoleShape } from '../App';
import type { HoleLayout } from '../utils/holeLayout';
import type { ModelRotation } from '../hooks/useModelRotation';

const STOCK_IMAGE = '/assets/generated/ocarina-stock-grey.dim_400x400.png';

interface HolePositioningEditorProps {
  photoUrl: string | null;
  holeShape: HoleShape;
  positions: HoleLayout;
  rotation: ModelRotation;
  onPositionChange: (holeId: keyof HoleLayout, x: number, y: number) => void;
  onReset: () => void;
  onRotationChange: (rotation: ModelRotation) => void;
  /** When provided, renders Save/Cancel buttons for modal usage */
  onSave?: () => void;
  onCancel?: () => void;
}

type HoleId = keyof HoleLayout;

const ROTATION_OPTIONS: { label: string; value: ModelRotation }[] = [
  { label: '0°', value: 0 },
  { label: '90°', value: 90 },
  { label: '180°', value: 180 },
  { label: '270°', value: 270 },
];

export default function HolePositioningEditor({
  photoUrl,
  holeShape,
  positions,
  rotation,
  onPositionChange,
  onReset,
  onRotationChange,
  onSave,
  onCancel,
}: HolePositioningEditorProps) {
  const [draggingHole, setDraggingHole] = useState<HoleId | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const backgroundImage = photoUrl || STOCK_IMAGE;

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
    e.preventDefault();
    setDraggingHole(holeId);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggingHole) return;
    e.preventDefault();
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
    setHasUnsavedChanges(false);
    toast.success('Hole positions saved!');
    onSave?.();
  };

  const handleResetClick = () => {
    onReset();
    setHasUnsavedChanges(false);
    toast.success('Positions reset to default');
  };

  const handleRotateCW = () => {
    const next = ((rotation + 90) % 360) as ModelRotation;
    onRotationChange(next);
    setHasUnsavedChanges(true);
  };

  const handleRotateCCW = () => {
    const next = (((rotation - 90) + 360) % 360) as ModelRotation;
    onRotationChange(next);
    setHasUnsavedChanges(true);
  };

  const holeLabels: Record<HoleId, string> = {
    leftIndex: 'L. Index',
    leftMiddle: 'L. Middle',
    rightIndex: 'R. Index',
    rightMiddle: 'R. Middle',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Position Holes on Model</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Drag each hole marker to match your ocarina's layout
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleResetClick}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}
          <Button
            variant={hasUnsavedChanges ? 'default' : 'outline'}
            size="sm"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-1" />
            {hasUnsavedChanges ? 'Save' : 'Saved'}
          </Button>
        </div>
      </div>

      {/* Rotation Controls */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground">Model Rotation:</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleRotateCCW} title="Rotate counter-clockwise">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <div className="flex gap-1">
            {ROTATION_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={rotation === opt.value ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  onRotationChange(opt.value);
                  setHasUnsavedChanges(true);
                }}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleRotateCW} title="Rotate clockwise">
            <RotateCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview of rotation */}
      <div className="flex gap-6 items-start">
        {/* Drag canvas */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-2">
            Drag holes to reposition (editing on unrotated view):
          </p>
          <div
            ref={containerRef}
            className="relative w-full bg-muted rounded-lg overflow-hidden cursor-crosshair border-2 border-border touch-none"
            style={{ height: '224px' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background image */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            {/* Holes */}
            {(['leftIndex', 'leftMiddle', 'rightIndex', 'rightMiddle'] as const).map((holeId) => {
              const pos = positions[holeId];
              const isDragging = draggingHole === holeId;

              return (
                <div
                  key={holeId}
                  className={cn(
                    getHoleShapeClass(holeShape),
                    'absolute border-4 transition-shadow cursor-move touch-none select-none',
                    isDragging && 'ring-4 ring-primary/50 scale-110 z-10'
                  )}
                  style={{
                    width: `${holeSize.width}px`,
                    height: `${holeSize.height}px`,
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: isDragging
                      ? 'rgba(255, 255, 255, 0.95)'
                      : 'rgba(255, 255, 255, 0.75)',
                    borderColor: isDragging ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                  }}
                  onMouseDown={() => handleMouseDown(holeId)}
                  onTouchStart={(e) => handleTouchStart(e, holeId)}
                >
                  {/* Label */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap bg-background/90 px-1.5 py-0.5 rounded shadow-sm border border-border">
                    {holeLabels[holeId]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rotation preview */}
        <div className="shrink-0">
          <p className="text-xs text-muted-foreground mb-2 text-center">Preview:</p>
          <div
            className="relative bg-muted rounded-lg border border-border overflow-hidden"
            style={{ width: '96px', height: '96px' }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease',
                  width: '72px',
                  height: '42px',
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '50%',
                  border: '2px solid hsl(var(--border))',
                }}
              />
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">{rotation}°</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {draggingHole
          ? `Moving ${holeLabels[draggingHole]}…`
          : 'Click or tap and drag holes to reposition'}
      </p>
    </div>
  );
}
