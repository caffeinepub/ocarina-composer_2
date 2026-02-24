export type OcarinaSizePreset = 'Small' | 'Medium' | 'Large';

const STORAGE_KEY = 'ocarinaSizePreset';

export function useOcarinaSize() {
  const getSize = (): OcarinaSizePreset => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'Small' || stored === 'Medium' || stored === 'Large') return stored;
    return 'Medium';
  };

  const setSize = (size: OcarinaSizePreset) => {
    localStorage.setItem(STORAGE_KEY, size);
    window.dispatchEvent(new CustomEvent('ocarinaSizeChanged', { detail: size }));
  };

  return { getSize, setSize };
}
