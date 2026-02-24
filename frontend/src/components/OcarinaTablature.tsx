import { cn } from '@/lib/utils';
import { useOcarinaColors } from '../hooks/useOcarinaColors';
import type { HoleShape } from '../App';
import type { FingeringChart } from '../types/fingering';

interface OcarinaTablatureProps {
  pitch: string;
  holeShape: HoleShape;
  fingeringChart?: FingeringChart;
}

export default function OcarinaTablature({ pitch, holeShape, fingeringChart }: OcarinaTablatureProps) {
  const { colors } = useOcarinaColors();
  const pattern = fingeringChart?.[pitch] || {
    leftIndex: false,
    leftMiddle: false,
    rightIndex: false,
    rightMiddle: false,
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
        return 'w-4 h-4';
      case 'oval':
        return 'w-3 h-5';
      case 'square':
        return 'w-4 h-4';
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {/* Left hand holes */}
      <div className="flex flex-col gap-1">
        {/* Left Index (front) */}
        <div
          className={cn(
            getHoleSize(holeShape),
            getHoleShapeClass(holeShape),
            'border-2 transition-colors'
          )}
          style={{
            backgroundColor: pattern.leftIndex ? colors.holeFill : 'white',
            borderColor: colors.holeStroke,
          }}
        />
        {/* Left Middle (back) */}
        <div
          className={cn(
            getHoleSize(holeShape),
            getHoleShapeClass(holeShape),
            'border-2 transition-colors'
          )}
          style={{
            backgroundColor: pattern.leftMiddle ? colors.holeFill : 'white',
            borderColor: colors.holeStroke,
          }}
        />
      </div>

      {/* Right hand holes */}
      <div className="flex flex-col gap-1">
        {/* Right Index (front) */}
        <div
          className={cn(
            getHoleSize(holeShape),
            getHoleShapeClass(holeShape),
            'border-2 transition-colors'
          )}
          style={{
            backgroundColor: pattern.rightIndex ? colors.holeFill : 'white',
            borderColor: colors.holeStroke,
          }}
        />
        {/* Right Middle (back) */}
        <div
          className={cn(
            getHoleSize(holeShape),
            getHoleShapeClass(holeShape),
            'border-2 transition-colors'
          )}
          style={{
            backgroundColor: pattern.rightMiddle ? colors.holeFill : 'white',
            borderColor: colors.holeStroke,
          }}
        />
      </div>
    </div>
  );
}
