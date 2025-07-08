
import { SearchResponse } from '@/types/music';

export const searchSaavnSongs = async (query: string): Promise<SearchResponse | null> => {
  if (!query.trim()) return null;
  console.log('Searching Saavn for:', query);
  const response = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search Saavn songs');
  }
  const data = await response.json() as SearchResponse;
  console.log('Saavn search results:', data);
  return data;
};
