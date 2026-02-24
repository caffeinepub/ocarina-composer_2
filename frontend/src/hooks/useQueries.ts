import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Song, Note } from '../backend';

export function useListSongs() {
  const { actor, isFetching } = useActor();

  return useQuery<Song[]>({
    queryKey: ['songs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      notes,
      lyrics,
    }: {
      title: string;
      description: string;
      notes: Note[];
      lyrics: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSong(title, description, notes, lyrics);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

export function useUpdateSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      notes,
      lyrics,
    }: {
      id: bigint;
      title: string;
      description: string;
      notes: Note[];
      lyrics: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSong(id, title, description, notes, lyrics);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

export function useDeleteSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSong(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}
