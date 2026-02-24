import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

// Placeholder queries for future backend integration
export function useGetSongs() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}
