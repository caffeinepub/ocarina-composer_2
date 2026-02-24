import { useState, useEffect } from 'react';

export type SampleAssignments = Record<string, string>; // note -> base64 data URL

const STORAGE_KEY = 'sampleAssignments';

export function useSampleAssignments() {
  const [assignments, setAssignmentsState] = useState<SampleAssignments>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const persist = (data: SampleAssignments) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAssignmentsState(data);
  };

  const assignSample = (note: string, dataUrl: string) => {
    const updated = { ...assignments, [note]: dataUrl };
    persist(updated);
  };

  const removeSample = (note: string) => {
    const updated = { ...assignments };
    delete updated[note];
    persist(updated);
  };

  const getSample = (note: string): string | undefined => {
    return assignments[note];
  };

  const setAllAssignments = (newAssignments: SampleAssignments) => {
    persist(newAssignments);
  };

  const clearAll = () => {
    persist({});
  };

  return { assignments, assignSample, removeSample, getSample, setAllAssignments, clearAll };
}
