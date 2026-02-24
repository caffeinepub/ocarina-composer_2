import { useState, useEffect } from 'react';
import { getHoleLayout, type HoleLayout } from '../utils/holeLayout';

const STORAGE_KEY = 'ocarinaComposer_customHolePositions';

export function useCustomHolePositions(bodyShape: 'round' | 'oval' | 'square' = 'round') {
  const [customPositions, setCustomPositions] = useState<HoleLayout | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed as HoleLayout;
        }
      }
    } catch {
      // ignore
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
    } catch {
      // ignore
    }
  }, [customPositions]);

  const positions: HoleLayout = customPositions || getHoleLayout(bodyShape);

  const setPosition = (holeId: keyof HoleLayout, x: number, y: number) => {
    setCustomPositions(prev => ({
      ...(prev || getHoleLayout(bodyShape)),
      [holeId]: { x, y },
    }));
  };

  // Alias: updatePosition = setPosition
  const updatePosition = setPosition;

  const resetToDefaults = () => {
    setCustomPositions(null);
  };

  // Alias: resetPositions = resetToDefaults
  const resetPositions = resetToDefaults;

  const hasCustomPositions = customPositions !== null;

  return {
    positions,
    setPosition,
    updatePosition,
    resetToDefaults,
    resetPositions,
    hasCustomPositions,
  };
}
