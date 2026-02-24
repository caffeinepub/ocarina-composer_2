import { useState, useEffect } from 'react';
import type { FingeringChart, FingeringPattern } from '../types/fingering';
import { defaultFingeringChart } from '../utils/defaultFingeringChart';

const STORAGE_KEY = 'ocarinComposer_fingeringChart';

export function useFingeringChart() {
  const [fingeringChart, setFingeringChart] = useState<FingeringChart>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed as FingeringChart;
        }
      }
    } catch {
      // ignore
    }
    return defaultFingeringChart;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fingeringChart));
    } catch {
      // ignore
    }
  }, [fingeringChart]);

  const updateNotePattern = (note: string, pattern: FingeringPattern) => {
    setFingeringChart(prev => ({ ...prev, [note]: pattern }));
  };

  // Alias used by OcarinaSettings
  const updateFingering = updateNotePattern;

  const resetToDefault = () => {
    setFingeringChart(defaultFingeringChart);
  };

  // Alias used by OcarinaSettings
  const resetToDefaults = resetToDefault;

  return {
    fingeringChart,
    updateNotePattern,
    updateFingering,
    resetToDefault,
    resetToDefaults,
  };
}
