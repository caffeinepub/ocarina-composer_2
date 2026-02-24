import { cn } from '@/lib/utils';
import { useOcarinaColors } from '../hooks/useOcarinaColors';
import { useOcarinaPhoto } from '../hooks/useOcarinaPhoto';
import { useCustomHolePositions } from '../hooks/useCustomHolePositions';
import { useModelRotation } from '../hooks/useModelRotation';
import { useModelScale } from '../hooks/useModelScale';
import { useFingeringChart } from '../hooks/useFingeringChart';
import type { HoleShape, BodyShape } from '../types/shapes';

interface OcarinaVisualProps {
  holeShape: HoleShape;
  bodyShape: BodyShape;
  activeNote?: string;
}

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

export default function OcarinaVisual({ holeShape, activeNote }: OcarinaVisualProps) {
  const { colors } = useOcarinaColors();
  const { photoUrl } = useOcarinaPhoto();
  const { positions } = useCustomHolePositions('round');
  const { rotation } = useModelRotation();
  const { scale } = useModelScale();
  const { fingeringChart } = useFingeringChart();

  const pattern = activeNote ? fingeringChart[activeNote] : null;
  const holeSize = getHoleSize(holeShape);

  return (
    <div className="flex justify-center overflow-hidden">
      <div
        className="relative"
        style={{
          transform: `rotate(${rotation}deg) scale(${scale / 100})`,
          transition: 'transform 0.3s ease',
          transformOrigin: 'center center',
        }}
      >
        {photoUrl ? (
          <div
            className="w-96 h-56 relative overflow-hidden"
            style={{ backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            {(['leftIndex', 'leftMiddle', 'rightIndex', 'rightMiddle'] as const).map((holeId) => {
              const pos = positions[holeId];
              const isCovered = pattern ? pattern[holeId] : false;
              return (
                <div
                  key={holeId}
                  className={cn(getHoleShapeClass(holeShape), 'absolute border-4 transition-all duration-300 shadow-inner')}
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
        ) : (
          <div
            className="w-96 h-56 shadow-2xl relative overflow-hidden rounded-full"
            style={{ backgroundColor: colors.bodyFill }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
            <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: colors.bodyOutline }} />
            <div
              className="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-16 rounded-l-full shadow-lg border-r-2"
              style={{ background: `linear-gradient(to right, ${colors.bodyFill}, ${colors.bodyOutline})`, borderRightColor: colors.bodyOutline }}
            >
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-8 bg-gray-900 rounded-full shadow-inner" />
            </div>
            {(['leftIndex', 'leftMiddle', 'rightIndex', 'rightMiddle'] as const).map((holeId) => {
              const pos = positions[holeId];
              const isCovered = pattern ? pattern[holeId] : false;
              return (
                <div
                  key={holeId}
                  className={cn(getHoleShapeClass(holeShape), 'absolute border-4 transition-all duration-300 shadow-inner')}
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
        )}
      </div>
    </div>
  );
}
