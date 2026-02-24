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
        // Validate that it's a proper fingering chart
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed as FingeringChart;
        }
      }
    } catch (error) {
      console.error('Failed to load fingering chart from localStorage:', error);
    }
    return defaultFingeringChart;
  });

  // Save to localStorage whenever the chart changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fingeringChart));
    } catch (error) {
      console.error('Failed to save fingering chart to localStorage:', error);
    }
  }, [fingeringChart]);

  const updateNotePattern = (note: string, pattern: FingeringPattern) => {
    setFingeringChart(prev => ({
      ...prev,
      [note]: pattern,
    }));
  };

  const resetToDefault = () => {
    setFingeringChart(defaultFingeringChart);
  };

  return {
    fingeringChart,
    updateNotePattern,
    resetToDefault,
  };
}
