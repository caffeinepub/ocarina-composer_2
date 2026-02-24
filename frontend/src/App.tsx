import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { Settings } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import PianoKeyboard from './components/PianoKeyboard';
import SheetMusic from './components/SheetMusic';
import OcarinaVisual from './components/OcarinaVisual';
import CompositionControls from './components/CompositionControls';
import SongMetadata from './components/SongMetadata';
import OcarinaSettings from './components/OcarinaSettings';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/sonner';
import { useFingeringChart } from './hooks/useFingeringChart';

export interface Note {
  pitch: string;
  duration: 'whole' | 'half' | 'quarter' | 'eighth';
  position: number;
  lyrics?: string;
}

export interface Song {
  title: string;
  description: string;
  notes: Note[];
}

export type HoleShape = 'round' | 'oval' | 'square';
export type BodyShape = 'round' | 'oval' | 'square';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState<number | null>(null);
  const [currentDuration, setCurrentDuration] = useState<Note['duration']>('quarter');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const [songMetadata, setSongMetadata] = useState<{ title: string; description: string }>({
    title: '',
    description: '',
  });
  const [holeShape, setHoleShape] = useState<HoleShape>(() => {
    const saved = localStorage.getItem('ocarina-hole-shape');
    return (saved as HoleShape) || 'round';
  });
  const [bodyShape, setBodyShape] = useState<BodyShape>(() => {
    const saved = localStorage.getItem('ocarina-body-shape');
    return (saved as BodyShape) || 'round';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { fingeringChart, updateNotePattern, resetToDefault } = useFingeringChart();

  useEffect(() => {
    localStorage.setItem('ocarina-hole-shape', holeShape);
  }, [holeShape]);

  useEffect(() => {
    localStorage.setItem('ocarina-body-shape', bodyShape);
  }, [bodyShape]);

  const addNote = (pitch: string) => {
    const newNote: Note = {
      pitch,
      duration: currentDuration,
      position: notes.length,
      lyrics: '',
    };
    setNotes([...notes, newNote]);
  };

  const deleteNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
    if (selectedNoteIndex === index) {
      setSelectedNoteIndex(null);
    }
  };

  const updateNote = (index: number, updates: Partial<Note>) => {
    setNotes(notes.map((note, i) => (i === index ? { ...note, ...updates } : note)));
  };

  const clearComposition = () => {
    setNotes([]);
    setSelectedNoteIndex(null);
    setCurrentPlayingIndex(null);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Song Metadata */}
            <SongMetadata
              metadata={songMetadata}
              onMetadataChange={setSongMetadata}
              notes={notes}
            />

            {/* Settings Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="default"
                onClick={() => setIsSettingsOpen(true)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>

            {/* Settings Dialog */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ocarina Settings</DialogTitle>
                </DialogHeader>
                <OcarinaSettings
                  holeShape={holeShape}
                  onHoleShapeChange={setHoleShape}
                  bodyShape={bodyShape}
                  onBodyShapeChange={setBodyShape}
                  fingeringChart={fingeringChart}
                  onUpdatePattern={updateNotePattern}
                  onResetFingering={resetToDefault}
                  onClose={() => setIsSettingsOpen(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Sheet Music Display */}
            <SheetMusic
              notes={notes}
              selectedNoteIndex={selectedNoteIndex}
              onNoteSelect={setSelectedNoteIndex}
              onNoteDelete={deleteNote}
              onLyricsUpdate={(index, lyrics) => updateNote(index, { lyrics })}
              currentPlayingIndex={currentPlayingIndex}
              holeShape={holeShape}
              fingeringChart={fingeringChart}
            />

            {/* Ocarina Visual - Always use round body shape for play-along */}
            <OcarinaVisual
              currentNote={
                currentPlayingIndex !== null ? notes[currentPlayingIndex]?.pitch : null
              }
              holeShape={holeShape}
              bodyShape="round"
              fingeringChart={fingeringChart}
            />

            {/* Composition Controls */}
            <CompositionControls
              notes={notes}
              currentDuration={currentDuration}
              onDurationChange={setCurrentDuration}
              isPlaying={isPlaying}
              onPlayToggle={setIsPlaying}
              onClear={clearComposition}
              onPlayingIndexChange={setCurrentPlayingIndex}
            />

            {/* Piano Keyboard */}
            <PianoKeyboard onNoteClick={addNote} disabled={isPlaying} />
          </div>
        </main>

        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
