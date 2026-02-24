import { cn } from '@/lib/utils';
import { useOcarinaColors } from '../hooks/useOcarinaColors';
import type { HoleShape } from '../types/shapes';
import type { FingeringChart } from '../types/fingering';

interface OcarinaTablatureProps {
  pitch: string;
  holeShape: HoleShape;
  fingeringChart?: FingeringChart;
}

const DEFAULT_PATTERN = {
  leftIndex: false,
  leftMiddle: false,
  rightIndex: false,
  rightMiddle: false,
};

export default function OcarinaTablature({ pitch, holeShape, fingeringChart }: OcarinaTablatureProps) {
  const { colors } = useOcarinaColors();
  const pattern = fingeringChart?.[pitch] || DEFAULT_PATTERN;

  const getHoleShapeClass = (shape: HoleShape) => {
    switch (shape) {
      case 'oval':   return 'rounded-full';
      case 'square': return 'rounded-sm';
      default:       return 'rounded-full';
    }
  };

  const getHoleSize = (shape: HoleShape) => {
    switch (shape) {
      case 'oval':   return 'w-3 h-5';
      case 'square': return 'w-4 h-4';
      default:       return 'w-4 h-4';
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {/* Left hand holes */}
      <div className="flex flex-col gap-1">
        <div
          className={cn(getHoleSize(holeShape), getHoleShapeClass(holeShape), 'border-2 transition-colors')}
          style={{ backgroundColor: pattern.leftIndex ? colors.holeFill : 'white', borderColor: colors.holeStroke }}
        />
        <div
          className={cn(getHoleSize(holeShape), getHoleShapeClass(holeShape), 'border-2 transition-colors')}
          style={{ backgroundColor: pattern.leftMiddle ? colors.holeFill : 'white', borderColor: colors.holeStroke }}
        />
      </div>
      {/* Right hand holes */}
      <div className="flex flex-col gap-1">
        <div
          className={cn(getHoleSize(holeShape), getHoleShapeClass(holeShape), 'border-2 transition-colors')}
          style={{ backgroundColor: pattern.rightIndex ? colors.holeFill : 'white', borderColor: colors.holeStroke }}
        />
        <div
          className={cn(getHoleSize(holeShape), getHoleShapeClass(holeShape), 'border-2 transition-colors')}
          style={{ backgroundColor: pattern.rightMiddle ? colors.holeFill : 'white', borderColor: colors.holeStroke }}
        />
      </div>
    </div>
  );
}
