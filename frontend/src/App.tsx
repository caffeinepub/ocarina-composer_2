import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import PianoKeyboard from './components/PianoKeyboard';
import SheetMusic from './components/SheetMusic';
import OcarinaVisual from './components/OcarinaVisual';
import OcarinaSettings from './components/OcarinaSettings';
import CompositionControls from './components/CompositionControls';
import SongMetadata from './components/SongMetadata';
import HolePositioningEditor from './components/HolePositioningEditor';
import SheetMusicUpload from './components/SheetMusicUpload';
import { useOcarinaPhoto } from './hooks/useOcarinaPhoto';
import { useCustomHolePositions } from './hooks/useCustomHolePositions';
import { useModelRotation } from './hooks/useModelRotation';
import { useListSongs } from './hooks/useQueries';
import { useOcarinaSize } from './hooks/useOcarinaSize';
import type { Note, Song } from './backend';
import type { HoleShape, BodyShape } from './types/shapes';
import type { OcarinaSizePreset } from './types/fingering';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, FolderOpen, Music2 } from 'lucide-react';

const queryClient = new QueryClient();

function AppContent() {
  const [holeShape, setHoleShape] = useState<HoleShape>('round');
  const [bodyShape, setBodyShape] = useState<BodyShape>('round');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedDuration, setSelectedDuration] = useState('quarter');
  const [selectedNoteIndex, setSelectedNoteIndex] = useState<number | null>(null);
  const [lyrics, setLyrics] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songDescription, setSongDescription] = useState('');
  const [currentSongId, setCurrentSongId] = useState<bigint | undefined>(undefined);
  const [showHoleEditor, setShowHoleEditor] = useState(false);
  const [showLoadSong, setShowLoadSong] = useState(false);
  const [showSheetMusicUpload, setShowSheetMusicUpload] = useState(false);

  const { photoUrl } = useOcarinaPhoto();
  const { positions, setPosition, resetToDefaults } = useCustomHolePositions('round');
  const { rotation, setRotation } = useModelRotation();
  const { data: songs = [] } = useListSongs();
  const { getSize } = useOcarinaSize();

  const ocarinaSizePreset: OcarinaSizePreset = getSize();

  const handleNoteSelect = (pitch: string) => {
    const newNote: Note = {
      pitch,
      duration: selectedDuration,
      timingPosition: BigInt(notes.length),
    };
    setNotes((prev) => [...prev, newNote]);
  };

  const handleNoteDelete = (index: number) => {
    setNotes((prev) => prev.filter((_, i) => i !== index));
    if (selectedNoteIndex === index) setSelectedNoteIndex(null);
  };

  const handleClear = () => {
    setNotes([]);
    setSelectedNoteIndex(null);
  };

  const handleNewSong = () => {
    setNotes([]);
    setLyrics('');
    setSongTitle('');
    setSongDescription('');
    setCurrentSongId(undefined);
    setSelectedNoteIndex(null);
  };

  const handleLoadSong = (song: Song) => {
    setNotes([...song.notes]);
    setLyrics(song.lyrics);
    setSongTitle(song.title);
    setSongDescription(song.description);
    setCurrentSongId(song.id);
    setSelectedNoteIndex(null);
    setShowLoadSong(false);
  };

  const handleSaved = (id: bigint) => {
    setCurrentSongId(id);
  };

  const handleImportNotes = (importedNotes: Note[]) => {
    setNotes(importedNotes);
    setSelectedNoteIndex(null);
    setShowSheetMusicUpload(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {/* Top bar: song management */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleNewSong} className="gap-1.5">
            <PlusCircle className="w-4 h-4" /> New Song
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLoadSong(true)}
            className="gap-1.5"
          >
            <FolderOpen className="w-4 h-4" /> Load Song
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSheetMusicUpload(true)}
            className="gap-1.5"
          >
            <Music2 className="w-4 h-4" /> Import Sheet Music
          </Button>
          {currentSongId !== undefined && (
            <span className="text-xs text-muted-foreground">
              Editing: <span className="font-semibold text-foreground">{songTitle}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Ocarina visual + settings */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-4 flex flex-col items-center gap-3">
              <OcarinaVisual
                holeShape={holeShape}
                bodyShape={bodyShape}
                activeNote={
                  selectedNoteIndex !== null ? notes[selectedNoteIndex]?.pitch : undefined
                }
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHoleEditor(true)}
                className="text-xs"
              >
                Position Holes &amp; Rotation
              </Button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">Settings</h3>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                <OcarinaSettings
                  holeShape={holeShape}
                  bodyShape={bodyShape}
                  onHoleShapeChange={setHoleShape}
                  onBodyShapeChange={setBodyShape}
                />
              </div>
            </div>
          </div>

          {/* Right columns: Song info, controls, sheet music, piano */}
          <div className="lg:col-span-2 space-y-4">
            {/* Song metadata */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">Song Info</h3>
              </div>
              <SongMetadata
                title={songTitle}
                description={songDescription}
                lyrics={lyrics}
                notes={notes}
                songId={currentSongId}
                onTitleChange={setSongTitle}
                onDescriptionChange={setSongDescription}
                onLyricsChange={setLyrics}
                onSaved={handleSaved}
              />
            </div>

            {/* Composition controls */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">Composition</h3>
              </div>
              <CompositionControls
                notes={notes}
                selectedDuration={selectedDuration}
                onDurationChange={setSelectedDuration}
                onClear={handleClear}
              />
            </div>

            {/* Sheet music */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">Sheet Music</h3>
              </div>
              <div className="p-4">
                <SheetMusic
                  notes={notes}
                  lyrics={lyrics}
                  selectedNoteIndex={selectedNoteIndex}
                  onNoteSelect={setSelectedNoteIndex}
                  onNoteDelete={handleNoteDelete}
                  onLyricsChange={setLyrics}
                  holeShape={holeShape}
                />
              </div>
            </div>

            {/* Piano keyboard */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">Piano Keyboard</h3>
              </div>
              <div className="p-4 overflow-x-auto">
                <PianoKeyboard onNoteSelect={handleNoteSelect} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Hole Positioning Editor Dialog */}
      <Dialog open={showHoleEditor} onOpenChange={setShowHoleEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Position Holes &amp; Rotation</DialogTitle>
          </DialogHeader>
          <HolePositioningEditor
            photoUrl={photoUrl}
            holeShape={holeShape}
            rotation={rotation}
            onRotationChange={setRotation}
            positions={positions}
            onPositionChange={setPosition}
            onReset={resetToDefaults}
            onSave={() => setShowHoleEditor(false)}
            onCancel={() => setShowHoleEditor(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Load Song Dialog */}
      <Dialog open={showLoadSong} onOpenChange={setShowLoadSong}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Load Song</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {songs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No songs saved yet. Create and save a song first.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {songs.map((song) => (
                  <button
                    key={song.id.toString()}
                    onClick={() => handleLoadSong(song)}
                    className="w-full text-left px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                  >
                    <div className="font-medium text-sm">{song.title}</div>
                    {song.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {song.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {song.notes.length} note{song.notes.length !== 1 ? 's' : ''}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sheet Music Import Dialog */}
      <Dialog open={showSheetMusicUpload} onOpenChange={setShowSheetMusicUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Sheet Music</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-xs text-muted-foreground mb-4">
              Upload sheet music to automatically load notes into your composition. Supports PNG/JPG images, MusicXML, and MIDI files. Notes will be transposed to fit the <strong>{ocarinaSizePreset}</strong> ocarina range.
            </p>
            <SheetMusicUpload
              currentNotes={notes}
              ocarinaSizePreset={ocarinaSizePreset}
              onImport={handleImportNotes}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Toaster richColors />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
