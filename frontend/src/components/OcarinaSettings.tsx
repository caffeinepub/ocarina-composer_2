import React, { useState, useRef } from 'react';
import { useOcarinaColors } from '../hooks/useOcarinaColors';
import { useOcarinaPhoto } from '../hooks/useOcarinaPhoto';
import { useModelRotation } from '../hooks/useModelRotation';
import { useModelScale } from '../hooks/useModelScale';
import { useFingeringChart } from '../hooks/useFingeringChart';
import FingeringEditor from './FingeringEditor';
import SampleUploadManager from './SampleUploadManager';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { HoleShape, BodyShape } from '../types/shapes';
import type { ModelRotation } from '../hooks/useModelRotation';

interface OcarinaSettingsProps {
  holeShape: HoleShape;
  bodyShape: BodyShape;
  onHoleShapeChange: (shape: HoleShape) => void;
  onBodyShapeChange: (shape: BodyShape) => void;
}

const ROTATION_OPTIONS: { label: string; value: ModelRotation }[] = [
  { label: '0°',   value: 0   },
  { label: '90°',  value: 90  },
  { label: '180°', value: 180 },
  { label: '270°', value: 270 },
];

export default function OcarinaSettings({
  holeShape,
  bodyShape,
  onHoleShapeChange,
  onBodyShapeChange,
}: OcarinaSettingsProps) {
  const { colors, setHoleFill, setHoleStroke, setBodyFill, setBodyOutline } = useOcarinaColors();
  const { photoUrl, uploadPhoto, removePhoto } = useOcarinaPhoto();
  const { rotation, setRotation } = useModelRotation();
  const { scale, setScale } = useModelScale();
  const { fingeringChart, updateNotePattern, resetToDefault } = useFingeringChart();
  const photoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6 p-4">
      {/* Hole Shape */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Hole Shape</Label>
        <div className="flex gap-2">
          {(['round', 'oval', 'square'] as HoleShape[]).map((shape) => (
            <button
              key={shape}
              onClick={() => onHoleShapeChange(shape)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize ${
                holeShape === shape
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Body Shape */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Body Shape</Label>
        <div className="flex gap-2">
          {(['round', 'oval', 'square'] as BodyShape[]).map((shape) => (
            <button
              key={shape}
              onClick={() => onBodyShapeChange(shape)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize ${
                bodyShape === shape
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Model Rotation */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Model Rotation</Label>
        <div className="flex rounded-lg overflow-hidden border border-border">
          {ROTATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRotation(opt.value)}
              className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                rotation === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Display Size */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Display Size: {scale}%</Label>
        <Slider
          min={50}
          max={200}
          step={5}
          value={[scale]}
          onValueChange={([v]) => setScale(v)}
          className="w-full"
        />
      </div>

      <Separator />

      {/* Colors */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Colors</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Hole Fill',    value: colors.holeFill,    onChange: setHoleFill    },
            { label: 'Hole Stroke',  value: colors.holeStroke,  onChange: setHoleStroke  },
            { label: 'Body Fill',    value: colors.bodyFill,    onChange: setBodyFill    },
            { label: 'Body Outline', value: colors.bodyOutline, onChange: setBodyOutline },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="flex items-center gap-2">
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-border"
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Photo Upload */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Ocarina Photo</Label>
        <div className="flex gap-2">
          <button
            onClick={() => photoInputRef.current?.click()}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
          >
            Upload Photo
          </button>
          {photoUrl && (
            <button
              onClick={removePhoto}
              className="px-3 py-1.5 rounded-md text-xs font-medium border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadPhoto(file);
          }}
        />
      </div>

      <Separator />

      {/* Fingering Chart Editor */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Fingering Chart</Label>
        <FingeringEditor
          fingeringChart={fingeringChart}
          holeShape={holeShape}
          onUpdatePattern={updateNotePattern}
          onReset={resetToDefault}
        />
      </div>

      <Separator />

      {/* Sample Audio */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Sample Audio</Label>
        <SampleUploadManager />
      </div>
    </div>
  );
}
