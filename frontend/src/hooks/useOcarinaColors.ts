import { useState, useEffect } from 'react';

export interface OcarinaColors {
  holeFill: string;
  holeStroke: string;
  bodyFill: string;
  bodyOutline: string;
}

const STORAGE_KEY = 'ocarinaComposer_colors';

const DEFAULT_COLORS: OcarinaColors = {
  holeFill: '#030712', // gray-950
  holeStroke: '#1f2937', // gray-800
  bodyFill: '#92400e', // amber-800
  bodyOutline: '#78350f', // amber-900
};

export function useOcarinaColors() {
  const [colors, setColors] = useState<OcarinaColors>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) {
          return { ...DEFAULT_COLORS, ...parsed };
        }
      }
    } catch (error) {
      console.error('Failed to load ocarina colors from localStorage:', error);
    }
    return DEFAULT_COLORS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
    } catch (error) {
      console.error('Failed to save ocarina colors to localStorage:', error);
    }
  }, [colors]);

  const setHoleFill = (color: string) => {
    setColors(prev => ({ ...prev, holeFill: color }));
  };

  const setHoleStroke = (color: string) => {
    setColors(prev => ({ ...prev, holeStroke: color }));
  };

  const setBodyFill = (color: string) => {
    setColors(prev => ({ ...prev, bodyFill: color }));
  };

  const setBodyOutline = (color: string) => {
    setColors(prev => ({ ...prev, bodyOutline: color }));
  };

  const resetToDefaults = () => {
    setColors(DEFAULT_COLORS);
  };

  return {
    colors,
    setHoleFill,
    setHoleStroke,
    setBodyFill,
    setBodyOutline,
    resetToDefaults,
  };
}
