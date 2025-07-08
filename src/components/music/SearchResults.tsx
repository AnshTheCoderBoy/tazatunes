
import React from 'react';
import { Music, Search, Play, Pause } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Song, AudiusTrack, CurrentSong, MusicSource, SearchResponse, AudiusResponse } from '@/types/music';
import { getSongImage, getSongName, getArtistName, getAlbumName } from '@/utils/musicUtils';

interface SearchResultsProps {
  saavnResults: SearchResponse | null | undefined;
  audiusResults: AudiusResponse | null | undefined;
  isLoading: boolean;
  searchQuery: string;
  currentSong: CurrentSong;
  currentSource: MusicSource;
  isPlaying: boolean;
  onPlaySong: (song: Song | AudiusTrack, source: MusicSource) => void;
}

export const SearchResults = ({
  saavnResults,
  audiusResults,
  isLoading,
  searchQuery,
  currentSong,
  currentSource,
  isPlaying,
  onPlaySong
}: SearchResultsProps) => {
  const hasResults = (saavnResults?.data?.results?.length || 0) > 0 || (audiusResults?.data?.length || 0) > 0;

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Music className="w-5 h-5 mr-2" />
          Search Results
        </h3>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p>Searching songs...</p>
          </div>
        ) : !hasResults && searchQuery ? (
          <div className="text-center py-8 text-gray-400">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No songs found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        ) : !searchQuery ? (
          <div className="text-center py-8 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Search for songs to get started</p>
            <p className="text-sm">Try searching for your favorite artist or song</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Audius Results */}
            {audiusResults?.data && audiusResults.data.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-green-400 mb-3 flex items-center">
                  <Music className="w-4 h-4 mr-2" />
                  Independent Artists (Audius) - {audiusResults.data.length}
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {audiusResults.data.map((track) => (
                    <div
                      key={`audius-${track.id}`}
                      onClick={() => onPlaySong(track, 'audius')}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-white/10 ${
                        currentSong?.id === track.id && currentSource === 'audius' ? 'bg-green-600/20 border border-green-500/30' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {track.artwork?.["150x150"] ? (
                            <img 
                              src={track.artwork["150x150"]} 
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Music className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{track.title}</p>
                          <p className="text-sm text-gray-400 truncate">{track.user.name}</p>
                          <p className="text-xs text-green-400 truncate">Independent • Audius</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10 ml-2 flex-shrink-0"
                      >
                        {currentSong?.id === track.id && currentSource === 'audius' && isPlaying ? 
                          <Pause className="w-4 h-4" /> : 
                          <Play className="w-4 h-4" />
                        }
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saavn Results */}
            {saavnResults?.data?.results && saavnResults.data.results.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-purple-400 mb-3 flex items-center">
                  <Music className="w-4 h-4 mr-2" />
                  Popular Music (Saavn) - {saavnResults.data.results.length}
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {saavnResults.data.results.map((song) => (
                    <div
                      key={`saavn-${song.id}`}
                      onClick={() => onPlaySong(song, 'saavn')}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-white/10 ${
                        currentSong?.id === song.id && currentSource === 'saavn' ? 'bg-purple-600/20 border border-purple-500/30' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {song.image && song.image.length > 0 ? (
                            <img 
                              src={song.image.find(img => img.quality === '150x150')?.link || song.image[0]?.link} 
                              alt={song.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Music className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{song.name}</p>
                          <p className="text-sm text-gray-400 truncate">
                            {song.artist.primary && song.artist.primary.length > 0 
                              ? song.artist.primary.map(a => a.name).join(', ')
                              : 'Unknown Artist'
                            }
                          </p>
                          <p className="text-xs text-purple-400 truncate">{song.album.name}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10 ml-2 flex-shrink-0"
                      >
                        {currentSong?.id === song.id && currentSource === 'saavn' && isPlaying ? 
                          <Pause className="w-4 h-4" /> : 
                          <Play className="w-4 h-4" />
                        }
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
