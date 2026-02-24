import React, { useState, useRef } from 'react';
import { useSampleAssignments } from '../hooks/useSampleAssignments';
import { useSamplePresets, SYNTH_PRESET } from '../hooks/useSamplePresets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Upload, Save, Music, X, Check } from 'lucide-react';
import { toast } from 'sonner';

// All possible notes across all presets
const ALL_NOTES = [
  'C4','D4','E4','F4','G4','A4','B4',
  'C5','D5','E5','F5','G5','A5','B5',
  'C6','D6','E6','F6','G6','A6','B6','C7',
];

export default function SampleUploadManager() {
  const { assignments, assignSample, removeSample, setAllAssignments } = useSampleAssignments();
  const { activePreset, allPresetNames, setActivePreset, savePreset, deletePreset, getPresetAssignments } =
    useSamplePresets();

  const [selectedNote, setSelectedNote] = useState<string>('C5');
  const [showNameInput, setShowNameInput] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const isSynth = activePreset === SYNTH_PRESET;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file (WAV or MP3)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      assignSample(selectedNote, dataUrl);
      toast.success(`Sample assigned to ${selectedNote}`);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePresetSwitch = (name: string) => {
    setActivePreset(name);
    const presetAssignments = getPresetAssignments(name);
    setAllAssignments(presetAssignments);
    toast.success(`Switched to "${name}" preset`);
  };

  const handleInitiateSave = () => {
    setShowNameInput(true);
    setNewPresetName('');
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const handleCancelSave = () => {
    setShowNameInput(false);
    setNewPresetName('');
  };

  const handleConfirmSave = () => {
    const name = newPresetName.trim();
    if (!name) {
      toast.error('Please enter a preset name');
      nameInputRef.current?.focus();
      return;
    }
    if (name === SYNTH_PRESET) {
      toast.error('"Synth" is a reserved preset name');
      return;
    }
    savePreset(name, assignments);
    setActivePreset(name);
    setShowNameInput(false);
    setNewPresetName('');
    toast.success(`Preset "${name}" saved`);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleConfirmSave();
    if (e.key === 'Escape') handleCancelSave();
  };

  const handleDeletePreset = (name: string) => {
    deletePreset(name);
    if (activePreset === name) {
      setAllAssignments({});
    }
    toast.success(`Preset "${name}" deleted`);
  };

  return (
    <div className="space-y-5">
      {/* Preset Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Active Preset</Label>
        <div className="flex gap-2 flex-wrap">
          {allPresetNames.map((name) => (
            <div key={name} className="flex items-center gap-1">
              <button
                onClick={() => handlePresetSwitch(name)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  activePreset === name
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {name === SYNTH_PRESET ? (
                  <span className="flex items-center gap-1">
                    <Music className="w-3 h-3" /> {name}
                  </span>
                ) : (
                  name
                )}
              </button>
              {name !== SYNTH_PRESET && (
                <button
                  onClick={() => handleDeletePreset(name)}
                  className="text-destructive hover:text-destructive/80 p-1"
                  title={`Delete "${name}" preset`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save as New Preset — inline naming flow */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Save as New Preset</Label>
        {showNameInput ? (
          <div className="flex gap-2 items-center">
            <Input
              ref={nameInputRef}
              placeholder="Enter preset name…"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              className="h-8 text-sm flex-1"
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleConfirmSave}
              disabled={!newPresetName.trim()}
              className="h-8 gap-1"
              title="Confirm save"
            >
              <Check className="w-3 h-3" /> Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelSave}
              className="h-8 gap-1"
              title="Cancel"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleInitiateSave}
            className="h-8 gap-1"
          >
            <Save className="w-3 h-3" /> Save Current as Preset
          </Button>
        )}
        {showNameInput && (
          <p className="text-xs text-muted-foreground">
            Give your preset a unique name, then click Save. Press Esc to cancel.
          </p>
        )}
      </div>

      {/* Upload Sample */}
      <div className={`space-y-3 ${isSynth ? 'opacity-50 pointer-events-none' : ''}`}>
        <Label className="text-sm font-semibold">
          Assign Sample to Note
          {isSynth && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (Switch to a custom preset to upload)
            </span>
          )}
        </Label>
        <div className="flex gap-2 items-center">
          <Select value={selectedNote} onValueChange={setSelectedNote}>
            <SelectTrigger className="w-24 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_NOTES.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-3 h-3" /> Upload Audio
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Current Assignments */}
      {Object.keys(assignments).length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Current Assignments</Label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {Object.entries(assignments).map(([note, dataUrl]) => (
              <div
                key={note}
                className="flex items-center justify-between bg-muted/50 rounded px-3 py-1.5 text-sm"
              >
                <span className="font-medium">{note}</span>
                <div className="flex items-center gap-2">
                  <audio
                    src={dataUrl}
                    controls
                    className="h-6"
                    style={{ width: '120px' }}
                  />
                  <button
                    onClick={() => removeSample(note)}
                    className="text-destructive hover:text-destructive/80"
                    title="Remove sample"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isSynth && (
        <p className="text-xs text-muted-foreground italic">
          The Synth preset uses synthesized Web Audio tones for all notes. Create a custom preset to
          upload your own ocarina recordings.
        </p>
      )}
    </div>
  );
}
