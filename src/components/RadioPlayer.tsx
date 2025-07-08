
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Radio, Search, Globe, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  country: string;
  tags: string;
  bitrate: number;
  votes: number;
  favicon: string;
}

export const RadioPlayer = () => {
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [selectedTag, setSelectedTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const countries = ['India', 'USA', 'UK', 'Germany', 'France', 'Japan', 'Australia', 'Canada'];
  const popularTags = ['bollywood', 'rock', 'pop', 'jazz', 'classical', 'electronic', 'country', 'hip-hop'];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const buildApiUrl = () => {
    let url = 'https://de1.api.radio-browser.info/json/stations';
    
    if (selectedCountry && selectedTag !== 'all') {
      url += `/bycountry/${selectedCountry}/bytag/${selectedTag}`;
    } else if (selectedCountry) {
      url += `/bycountry/${selectedCountry}`;
    } else if (selectedTag !== 'all') {
      url += `/bytag/${selectedTag}`;
    }
    
    return url;
  };

  const { data: stations, isLoading, error } = useQuery({
    queryKey: ['radio-stations', selectedCountry, selectedTag],
    queryFn: async () => {
      console.log('Fetching stations from:', buildApiUrl());
      const response = await fetch(buildApiUrl());
      if (!response.ok) {
        throw new Error('Failed to fetch radio stations');
      }
      const data = await response.json();
      console.log('Fetched stations:', data.length);
      return data as RadioStation[];
    },
  });

  const filteredStations = stations?.filter(station => 
    searchQuery === '' || 
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.tags.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const playStation = async (station: RadioStation) => {
    if (currentStation?.stationuuid === station.stationuuid) {
      togglePlayPause();
      return;
    }

    console.log('Playing station:', station.name, station.url_resolved);
    
    if (audioRef.current) {
      try {
        audioRef.current.src = station.url_resolved || station.url;
        audioRef.current.load();
        await audioRef.current.play();
        setCurrentStation(station);
        setIsPlaying(true);
        toast({
          title: "Now Playing",
          description: `${station.name} - ${station.country}`,
        });
      } catch (error) {
        console.error('Error playing station:', error);
        toast({
          title: "Playback Error",
          description: "Unable to play this radio station",
          variant: "destructive",
        });
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentStation) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error resuming playback:', error);
        toast({
          title: "Playback Error",
          description: "Unable to resume playback",
          variant: "destructive",
        });
      });
    }
    setIsPlaying(!isPlaying);
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setCurrentStation(null);
  };

  return (
    <div className="space-y-6">
      <audio 
        ref={audioRef}
        onError={(e) => {
          console.error('Audio error:', e);
          toast({
            title: "Playback Error",
            description: "Unable to play this radio station",
            variant: "destructive",
          });
          setIsPlaying(false);
        }}
      />
      
      {/* Filters */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Country
              </label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  {countries.map(country => (
                    <SelectItem key={country} value={country} className="text-white hover:bg-white/10">
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Genre
              </label>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="All genres" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  <SelectItem value="all" className="text-white hover:bg-white/10">All genres</SelectItem>
                  {popularTags.map(tag => (
                    <SelectItem key={tag} value={tag} className="text-white hover:bg-white/10 capitalize">
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stations..."
                className="bg-black/20 border-white/10 text-white placeholder-gray-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Playing */}
      {currentStation && (
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">{currentStation.name}</h3>
              <div className="text-sm text-gray-400">
                {currentStation.country} • {currentStation.bitrate}kbps
              </div>
              {currentStation.tags && (
                <div className="text-xs text-purple-400 mt-1">
                  {currentStation.tags.split(',').slice(0, 3).join(', ')}
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Button
                onClick={togglePlayPause}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-4"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <Button
                onClick={stopPlayback}
                variant="ghost"
                className="text-white hover:bg-white/10 rounded-full px-4 py-2"
              >
                Stop
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <Slider
                value={volume}
                max={100}
                step={1}
                onValueChange={setVolume}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stations List */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Radio className="w-5 h-5 mr-2" />
            Available Stations
            {filteredStations.length > 0 && (
              <span className="text-sm text-gray-400 ml-2">({filteredStations.length})</span>
            )}
          </h3>
          
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">
              <Radio className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
              <p>Loading radio stations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Error loading stations</p>
              <p className="text-sm text-gray-400">Please try again later</p>
            </div>
          ) : filteredStations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No stations found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStations.slice(0, 50).map((station) => (
                <div
                  key={station.stationuuid}
                  onClick={() => playStation(station)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-white/10 ${
                    currentStation?.stationuuid === station.stationuuid ? 'bg-purple-600/20 border border-purple-500/30' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      {station.favicon ? (
                        <img 
                          src={station.favicon} 
                          alt="" 
                          className="w-6 h-6 rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Radio className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{station.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>{station.country}</span>
                        {station.bitrate > 0 && (
                          <>
                            <span>•</span>
                            <span>{station.bitrate}kbps</span>
                          </>
                        )}
                        {station.votes > 0 && (
                          <>
                            <span>•</span>
                            <span>♥ {station.votes}</span>
                          </>
                        )}
                      </div>
                      {station.tags && (
                        <p className="text-xs text-purple-400 truncate mt-1">
                          {station.tags.split(',').slice(0, 3).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/10 ml-2 flex-shrink-0"
                  >
                    {currentStation?.stationuuid === station.stationuuid && isPlaying ? 
                      <Pause className="w-4 h-4" /> : 
                      <Play className="w-4 h-4" />
                    }
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
