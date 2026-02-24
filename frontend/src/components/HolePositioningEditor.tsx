import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RotateCcw, Save, X, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import type { HoleShape } from '../types/shapes';
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
  onSave?: () => void;
  onCancel?: () => void;
}

type HoleId = keyof HoleLayout;

const ROTATION_OPTIONS: { label: string; value: ModelRotation }[] = [
  { label: '0°',   value: 0   },
  { label: '90°',  value: 90  },
  { label: '180°', value: 180 },
  { label: '270°', value: 270 },
];

const getHoleShapeClass = (shape: HoleShape) => {
  switch (shape) {
    case 'oval':   return 'rounded-full';
    case 'square': return 'rounded-sm';
    default:       return 'rounded-full';
  }
};

const getHoleSize = (shape: HoleShape) => {
  switch (shape) {
    case 'oval':   return { width: 40, height: 56 };
    case 'square': return { width: 48, height: 48 };
    default:       return { width: 48, height: 48 };
  }
};

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
  const holeSize = getHoleSize(holeShape);

  const updatePosition = (clientX: number, clientY: number) => {
    if (!draggingHole || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const clampedX = Math.max(holeSize.width / 2, Math.min(x, rect.width  - holeSize.width  / 2));
    const clampedY = Math.max(holeSize.height / 2, Math.min(y, rect.height - holeSize.height / 2));
    onPositionChange(draggingHole, clampedX, clampedY);
    setHasUnsavedChanges(true);
  };

  const handleMouseDown = (holeId: HoleId) => setDraggingHole(holeId);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => { if (draggingHole) updatePosition(e.clientX, e.clientY); };
  const handleMouseUp   = () => setDraggingHole(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, holeId: HoleId) => { e.preventDefault(); setDraggingHole(holeId); };
  const handleTouchMove  = (e: React.TouchEvent<HTMLDivElement>) => { if (!draggingHole) return; e.preventDefault(); const t = e.touches[0]; if (t) updatePosition(t.clientX, t.clientY); };
  const handleTouchEnd   = (e: React.TouchEvent<HTMLDivElement>) => { e.preventDefault(); setDraggingHole(null); };

  useEffect(() => {
    if (!draggingHole) return;
    const up = () => setDraggingHole(null);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => { window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up); };
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

  const handleRotateCW  = () => { onRotationChange(((rotation + 90)  % 360) as ModelRotation); setHasUnsavedChanges(true); };
  const handleRotateCCW = () => { onRotationChange(((rotation - 90 + 360) % 360) as ModelRotation); setHasUnsavedChanges(true); };

  const holeLabels: Record<HoleId, string> = {
    leftIndex:   'L. Index',
    leftMiddle:  'L. Middle',
    rightIndex:  'R. Index',
    rightMiddle: 'R. Middle',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Position Holes on Model</h3>
          <p className="text-xs text-muted-foreground mt-1">Drag each hole marker to match your ocarina's layout</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleResetClick}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          )}
          <Button variant={hasUnsavedChanges ? 'default' : 'outline'} size="sm" onClick={handleSave}>
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
                onClick={() => { onRotationChange(opt.value); setHasUnsavedChanges(true); }}
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

      {/* Drag canvas */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Drag holes to reposition:</p>
        <div
          ref={containerRef}
          className="relative w-full bg-muted rounded-lg overflow-hidden select-none"
          style={{ height: '280px', cursor: draggingHole ? 'grabbing' : 'default' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Background image */}
          <img
            src={backgroundImage}
            alt="Ocarina"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            draggable={false}
          />

          {/* Hole markers */}
          {(Object.keys(positions) as HoleId[]).map((holeId) => {
            const pos = positions[holeId];
            return (
              <div
                key={holeId}
                className={cn(
                  getHoleShapeClass(holeShape),
                  'absolute border-4 border-primary bg-primary/40 cursor-grab active:cursor-grabbing',
                  'flex items-center justify-center shadow-lg transition-shadow hover:shadow-xl',
                  draggingHole === holeId && 'shadow-xl scale-110'
                )}
                style={{
                  width:  `${holeSize.width}px`,
                  height: `${holeSize.height}px`,
                  left:   `${pos.x}px`,
                  top:    `${pos.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={() => handleMouseDown(holeId)}
                onTouchStart={(e) => handleTouchStart(e, holeId)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <span className="text-[9px] font-bold text-primary-foreground text-center leading-tight px-0.5">
                  {holeLabels[holeId]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
