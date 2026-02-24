import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileMusic, Image, X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Note } from '../backend';
import type { OcarinaSizePreset } from '../types/fingering';
import { parseMusicXML } from '../utils/musicXMLParser';
import { parseMIDI } from '../utils/midiParser';
import { parseSheetMusicImage } from '../utils/sheetMusicParser';
import { transposeNotesToPreset } from '../utils/noteTransposer';

interface SheetMusicUploadProps {
  currentNotes: Note[];
  ocarinaSizePreset: OcarinaSizePreset;
  onImport: (notes: Note[]) => void;
}

type ImportMode = 'replace' | 'append';

interface ImportSummary {
  totalImported: number;
  transposedCount: number;
  skippedCount: number;
  fileName: string;
  format: string;
}

export default function SheetMusicUpload({
  currentNotes,
  ocarinaSizePreset,
  onImport,
}: SheetMusicUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importMode, setImportMode] = useState<ImportMode>('replace');
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingNotes, setPendingNotes] = useState<Note[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_TYPES = '.png,.jpg,.jpeg,.xml,.musicxml,.mid,.midi';

  const getFileFormat = (file: File): string => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (['png', 'jpg', 'jpeg'].includes(ext)) return 'Image';
    if (['xml', 'musicxml'].includes(ext)) return 'MusicXML';
    if (['mid', 'midi'].includes(ext)) return 'MIDI';
    return 'Unknown';
  };

  const processFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setError(null);
      setSummary(null);
      setPendingNotes(null);

      const format = getFileFormat(file);
      if (format === 'Unknown') {
        setError('Unsupported file format. Please upload PNG, JPG, MusicXML, or MIDI files.');
        setIsProcessing(false);
        return;
      }

      try {
        let rawNotes: Note[] = [];

        if (format === 'Image') {
          rawNotes = await parseSheetMusicImage(file);
        } else if (format === 'MusicXML') {
          const text = await file.text();
          rawNotes = parseMusicXML(text);
        } else if (format === 'MIDI') {
          const buffer = await file.arrayBuffer();
          rawNotes = parseMIDI(buffer);
        }

        if (rawNotes.length === 0) {
          setError('No notes could be extracted from the file.');
          setIsProcessing(false);
          return;
        }

        // Transpose to fit ocarina range
        const result = transposeNotesToPreset(rawNotes, ocarinaSizePreset);

        if (result.totalImported === 0) {
          setError(
            `None of the ${rawNotes.length} notes in the file fit the ${ocarinaSizePreset} ocarina range, even after transposition. Try a different ocarina size preset.`
          );
          setIsProcessing(false);
          return;
        }

        setPendingNotes(result.notes);
        setSummary({
          totalImported: result.totalImported,
          transposedCount: result.transposedCount,
          skippedCount: result.skippedCount,
          fileName: file.name,
          format,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error during parsing';
        setError(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [ocarinaSizePreset]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleConfirmImport = () => {
    if (!pendingNotes) return;

    let finalNotes: Note[];
    if (importMode === 'replace') {
      finalNotes = pendingNotes;
    } else {
      const offset = currentNotes.length;
      finalNotes = [
        ...currentNotes,
        ...pendingNotes.map((n) => ({ ...n, timingPosition: BigInt(offset + Number(n.timingPosition)) })),
      ];
    }

    onImport(finalNotes);
    toast.success(
      `Imported ${pendingNotes.length} note${pendingNotes.length !== 1 ? 's' : ''} from ${summary?.fileName}`
    );
    setSummary(null);
    setPendingNotes(null);
    setError(null);
  };

  const handleCancel = () => {
    setSummary(null);
    setPendingNotes(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {!summary && !isProcessing && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Image className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="p-2 rounded-lg bg-muted">
                <FileMusic className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Drop sheet music here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports PNG, JPG (image), MusicXML (.xml), MIDI (.mid)
              </p>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <Upload className="w-3.5 h-3.5" /> Choose File
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-3 py-8 border-2 border-dashed border-border rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Parsing sheet music…</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Import Failed</AlertTitle>
          <AlertDescription className="text-xs mt-1">{error}</AlertDescription>
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 h-7 text-xs"
            onClick={handleCancel}
          >
            Try Again
          </Button>
        </Alert>
      )}

      {/* Import summary & confirmation */}
      {summary && pendingNotes && (
        <div className="border border-border rounded-xl p-4 space-y-4 bg-card">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Ready to Import</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{summary.fileName}</p>
              </div>
            </div>
            <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs gap-1">
              <FileMusic className="w-3 h-3" /> {summary.format}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {summary.totalImported} note{summary.totalImported !== 1 ? 's' : ''}
            </Badge>
            {summary.transposedCount > 0 && (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                {summary.transposedCount} transposed
              </Badge>
            )}
            {summary.skippedCount > 0 && (
              <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                {summary.skippedCount} skipped
              </Badge>
            )}
          </div>

          {(summary.transposedCount > 0 || summary.skippedCount > 0) && (
            <p className="text-xs text-muted-foreground">
              {summary.transposedCount > 0 && (
                <>Notes outside the <strong>{ocarinaSizePreset}</strong> ocarina range were transposed to the nearest available octave. </>
              )}
              {summary.skippedCount > 0 && (
                <>Notes that could not be mapped to any ocarina pitch were skipped.</>
              )}
            </p>
          )}

          {/* Import mode */}
          <div className="space-y-2">
            <p className="text-xs font-semibold">Import mode</p>
            <div className="flex gap-2">
              <button
                onClick={() => setImportMode('replace')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  importMode === 'replace'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border hover:bg-muted'
                }`}
              >
                Replace current notes
              </button>
              <button
                onClick={() => setImportMode('append')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  importMode === 'append'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border hover:bg-muted'
                }`}
              >
                Append to current
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleConfirmImport} className="flex-1 gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Import Notes
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
