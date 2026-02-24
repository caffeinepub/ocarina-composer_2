import { useState, useEffect } from 'react';
import { getHoleLayout, type HoleLayout } from '../utils/holeLayout';
import type { BodyShape } from '../App';

const STORAGE_KEY = 'ocarinaComposer_customHolePositions';

export function useCustomHolePositions(bodyShape: BodyShape) {
  const [customPositions, setCustomPositions] = useState<HoleLayout | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed as HoleLayout;
        }
      }
    } catch (error) {
      console.error('Failed to load custom hole positions from localStorage:', error);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (customPositions) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customPositions));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save custom hole positions to localStorage:', error);
    }
  }, [customPositions]);

  const getPositions = (): HoleLayout => {
    return customPositions || getHoleLayout(bodyShape);
  };

  const setPosition = (holeId: keyof HoleLayout, x: number, y: number) => {
    setCustomPositions(prev => ({
      ...(prev || getHoleLayout(bodyShape)),
      [holeId]: { x, y },
    }));
  };

  const resetToDefaults = () => {
    setCustomPositions(null);
  };

  const hasCustomPositions = customPositions !== null;

  return {
    positions: getPositions(),
    setPosition,
    resetToDefaults,
    hasCustomPositions,
  };
}
