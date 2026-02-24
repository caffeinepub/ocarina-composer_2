import { cn } from '@/lib/utils';
import { useOcarinaColors } from '../hooks/useOcarinaColors';
import { useOcarinaPhoto } from '../hooks/useOcarinaPhoto';
import { useCustomHolePositions } from '../hooks/useCustomHolePositions';
import type { HoleShape, BodyShape } from '../App';
import type { FingeringChart } from '../types/fingering';

interface OcarinaVisualProps {
  currentNote: string | null;
  holeShape: HoleShape;
  bodyShape: BodyShape;
  fingeringChart?: FingeringChart;
}

export default function OcarinaVisual({ currentNote, holeShape, bodyShape, fingeringChart }: OcarinaVisualProps) {
  const pattern = currentNote && fingeringChart ? fingeringChart[currentNote] : null;
  const { colors } = useOcarinaColors();
  const { photoUrl } = useOcarinaPhoto();
  // Always use round body shape for play-along visual to match tablature
  const { positions } = useCustomHolePositions('round');

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

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Ocarina Fingering</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {currentNote ? `Current note: ${currentNote}` : 'Play a note to see fingering'}
      </p>

      <div className="flex justify-center">
        <div className="relative -rotate-90">
          {/* Ocarina body - always round for play-along */}
          <div
            className={cn(
              'w-96 h-56 shadow-2xl relative overflow-hidden',
              !photoUrl && 'rounded-full'
            )}
            style={{
              backgroundColor: photoUrl ? 'transparent' : colors.bodyFill,
              backgroundImage: photoUrl ? `url(${photoUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Shine effect (only for non-photo) */}
            {!photoUrl && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
                {/* Body outline */}
                <div
                  className="absolute inset-0 border-4 rounded-full"
                  style={{ borderColor: colors.bodyOutline }}
                />
              </>
            )}

            {/* Mouthpiece at the front center (only for non-photo) */}
            {!photoUrl && (
              <div
                className="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-16 rounded-l-full shadow-lg border-r-2"
                style={{
                  background: `linear-gradient(to right, ${colors.bodyFill}, ${colors.bodyOutline})`,
                  borderRightColor: colors.bodyOutline,
                }}
              >
                {/* Air intake opening */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-8 bg-gray-900 rounded-full shadow-inner" />
              </div>
            )}

            {/* Holes - using consistent positions from round body shape */}
            {(['leftIndex', 'leftMiddle', 'rightIndex', 'rightMiddle'] as const).map((holeId) => {
              const pos = positions[holeId];
              const isCovered = pattern && pattern[holeId];

              return (
                <div
                  key={holeId}
                  className={cn(
                    getHoleShapeClass(holeShape),
                    'absolute border-4 transition-all duration-300 shadow-inner'
                  )}
                  style={{
                    width: `${holeSize.width}px`,
                    height: `${holeSize.height}px`,
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: isCovered ? colors.holeFill : 'transparent',
                    borderColor: colors.holeStroke,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div
            className={cn('w-6 h-6 border-2', getHoleShapeClass(holeShape))}
            style={{
              backgroundColor: colors.holeFill,
              borderColor: colors.holeStroke,
            }}
          />
          <span className="text-muted-foreground">Covered</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn('w-6 h-6 bg-transparent border-2', getHoleShapeClass(holeShape))}
            style={{ borderColor: colors.holeStroke }}
          />
          <span className="text-muted-foreground">Open</span>
        </div>
      </div>
    </div>
  );
}
