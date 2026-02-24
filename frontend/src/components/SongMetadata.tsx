import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateSong, useUpdateSong } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Note } from '../backend';
import { Loader2 } from 'lucide-react';

interface SongMetadataProps {
  title: string;
  description: string;
  lyrics: string;
  notes: Note[];
  songId?: bigint;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onLyricsChange: (lyrics: string) => void;
  onSaved?: (id: bigint) => void;
}

export default function SongMetadata({
  title,
  description,
  lyrics,
  notes,
  songId,
  onTitleChange,
  onDescriptionChange,
  onLyricsChange,
  onSaved,
}: SongMetadataProps) {
  const createSong = useCreateSong();
  const updateSong = useUpdateSong();

  const isSaving = createSong.isPending || updateSong.isPending;

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a song title');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (notes.length === 0) {
      toast.error('Add at least one note before saving');
      return;
    }

    try {
      if (songId !== undefined) {
        await updateSong.mutateAsync({ id: songId, title, description, notes, lyrics });
        toast.success('Song updated successfully!');
        onSaved?.(songId);
      } else {
        const newId = await createSong.mutateAsync({ title, description, notes, lyrics });
        toast.success('Song saved online!');
        onSaved?.(newId);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save song');
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1.5">
        <Label htmlFor="song-title" className="text-sm font-semibold">
          Song Title
        </Label>
        <Input
          id="song-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter song title..."
          className="h-9"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="song-description" className="text-sm font-semibold">
          Description
        </Label>
        <Textarea
          id="song-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe your song..."
          rows={2}
          className="resize-none text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="song-lyrics" className="text-sm font-semibold">
          Lyrics
        </Label>
        <Textarea
          id="song-lyrics"
          value={lyrics}
          onChange={(e) => onLyricsChange(e.target.value)}
          placeholder="Add lyrics..."
          rows={3}
          className="resize-none text-sm"
        />
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2">
        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSaving ? 'Saving...' : songId !== undefined ? 'Update Song' : 'Save Song Online'}
      </Button>
    </div>
  );
}
