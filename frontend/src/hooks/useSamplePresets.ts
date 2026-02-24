import { useState } from 'react';
import { SampleAssignments } from './useSampleAssignments';

export type SamplePresets = Record<string, SampleAssignments>;

const PRESETS_KEY = 'samplePresets';
const ACTIVE_PRESET_KEY = 'activeSamplePreset';
export const SYNTH_PRESET = 'Synth';

export function useSamplePresets() {
  const [presets, setPresetsState] = useState<SamplePresets>(() => {
    try {
      const stored = localStorage.getItem(PRESETS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [activePreset, setActivePresetState] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_PRESET_KEY) || SYNTH_PRESET;
  });

  const persistPresets = (data: SamplePresets) => {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(data));
    setPresetsState(data);
  };

  const setActivePreset = (name: string) => {
    localStorage.setItem(ACTIVE_PRESET_KEY, name);
    setActivePresetState(name);
  };

  const savePreset = (name: string, assignments: SampleAssignments) => {
    if (name === SYNTH_PRESET) return;
    const updated = { ...presets, [name]: assignments };
    persistPresets(updated);
  };

  const deletePreset = (name: string) => {
    if (name === SYNTH_PRESET) return;
    const updated = { ...presets };
    delete updated[name];
    persistPresets(updated);
    if (activePreset === name) {
      setActivePreset(SYNTH_PRESET);
    }
  };

  const getPresetAssignments = (name: string): SampleAssignments => {
    if (name === SYNTH_PRESET) return {};
    return presets[name] || {};
  };

  const allPresetNames = [SYNTH_PRESET, ...Object.keys(presets)];

  return {
    presets,
    activePreset,
    allPresetNames,
    setActivePreset,
    savePreset,
    deletePreset,
    getPresetAssignments,
  };
}
