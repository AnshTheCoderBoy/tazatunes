
import { AudiusResponse } from '@/types/music';

export const searchAudiusSongs = async (query: string): Promise<AudiusResponse | null> => {
  if (!query.trim()) return null;
  console.log('Searching Audius for:', query);
  const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&limit=20`);
  if (!response.ok) {
    throw new Error('Failed to search Audius songs');
  }
  const data = await response.json() as AudiusResponse;
  console.log('Audius search results:', data);
  return data;
};
