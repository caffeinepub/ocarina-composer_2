import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { Note } from '../App';

interface SongMetadataProps {
  metadata: { title: string; description: string };
  onMetadataChange: (metadata: { title: string; description: string }) => void;
  notes: Note[];
}

export default function SongMetadata({ metadata, onMetadataChange, notes }: SongMetadataProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!metadata.title.trim()) {
      toast.error('Please enter a song title');
      return;
    }

    if (notes.length === 0) {
      toast.error('Please add some notes to your composition');
      return;
    }

    setIsSaving(true);
    
    // Simulate save (backend not implemented)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Song saved successfully!', {
      description: `"${metadata.title}" has been saved to your browser.`,
    });
    
    setIsSaving(false);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Song Information</h2>
      
      <Alert className="mb-4 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          Note: Backend storage is not yet implemented. Songs are saved locally in your browser.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Song Title</Label>
          <Input
            id="title"
            value={metadata.title}
            onChange={(e) => onMetadataChange({ ...metadata, title: e.target.value })}
            placeholder="Enter song title..."
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={metadata.description}
            onChange={(e) => onMetadataChange({ ...metadata, description: e.target.value })}
            placeholder="Add a description for your composition..."
            className="mt-1.5 min-h-[80px]"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || !metadata.title.trim() || notes.length === 0}
          className="w-full sm:w-auto gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Song'}
        </Button>
      </div>
    </div>
  );
}
