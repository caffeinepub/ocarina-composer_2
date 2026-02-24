import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ocarinaComposer_modelRotation';

export type ModelRotation = 0 | 90 | 180 | 270;

export function useModelRotation() {
  const [rotation, setRotationState] = useState<ModelRotation>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if ([0, 90, 180, 270].includes(parsed)) {
          return parsed as ModelRotation;
        }
      }
    } catch {
      // ignore
    }
    return 90; // default: mouthpiece pointing up
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(rotation));
    } catch {
      // ignore
    }
  }, [rotation]);

  const setRotation = (r: ModelRotation) => setRotationState(r);

  return { rotation, setRotation };
}
