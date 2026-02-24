import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ocarina-model-scale';

export function useModelScale() {
  const [scale, setScaleState] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 50 && parsed <= 200) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return 100;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(scale));
    } catch {
      // ignore
    }
  }, [scale]);

  const setScale = (value: number) => {
    const clamped = Math.max(50, Math.min(200, Math.round(value)));
    setScaleState(clamped);
  };

  const resetScale = () => setScaleState(100);

  return { scale, setScale, resetScale };
}
