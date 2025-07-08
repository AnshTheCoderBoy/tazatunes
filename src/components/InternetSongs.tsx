
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchBar } from './music/SearchBar';
import { SearchResults } from './music/SearchResults';
import { CurrentPlayingCard } from './music/CurrentPlayingCard';
import { searchSaavnSongs } from '@/services/saavnApi';
import { searchAudiusSongs } from '@/services/audiusApi';
import { Song, AudiusTrack, CurrentSong, MusicSource } from '@/types/music';
import { isSaavnSong, isAudiusTrack, getSongName, getArtistName } from '@/utils/musicUtils';
import { toast } from '@/hooks/use-toast';

// Default songs data organized by genre
const defaultSongsByGenre = {
  bollywood: [
    {
      id: 'default-1',
      name: 'Kesariya',
      artist: {
        primary: [{ name: 'Arijit Singh', id: 'arijit-singh' }]
      },
      album: { name: 'Brahmastra', id: 'brahmastra' },
      duration: 240,
      downloadUrl: [{ quality: '320kbps', link: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' }],
      image: [
        { quality: '150x150', link: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop' },
        { quality: '500x500', link: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop' }
      ]
    },
    {
      id: 'default-2',
      name: 'Tum Hi Ho',
      artist: {
        primary: [{ name: 'Arijit Singh', id: 'arijit-singh' }]
      },
      album: { name: 'Aashiqui 2', id: 'aashiqui-2' },
      duration: 262,
      downloadUrl: [{ quality: '320kbps', link: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' }],
      image: [
        { quality: '150x150', link: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&h=150&fit=crop' },
        { quality: '500x500', link: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=500&fit=crop' }
      ]
    },
    {
      id: 'default-3',
      name: 'Raabta',
      artist: {
        primary: [{ name: 'Arijit Singh', id: 'arijit-singh' }]
      },
      album: { name: 'Agent Vinod', id: 'agent-vinod' },
      duration: 275,
      downloadUrl: [{ quality: '320kbps', link: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' }],
      image: [
        { quality: '150x150', link: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&h=150&fit=crop' },
        { quality: '500x500', link: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&h=500&fit=crop' }
      ]
    }
  ],
  pop: [
    {
      id: 'default-4',
      name: 'Perfect',
      artist: {
        primary: [{ name: 'Ed Sheeran', id: 'ed-sheeran' }]
      },
      album: { name: 'Divide', id: 'divide' },
      duration: 263,
      downloadUrl: [{ quality: '320kbps', link: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' }],
      image: [
        { quality: '150x150', link: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop' },
        { quality: '500x500', link: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=500&h=500&fit=crop' }
      ]
    },
    {
      id: 'default-5',
      name: 'Shape of You',
      artist: {
        primary: [{ name: 'Ed Sheeran', id: 'ed-sheeran' }]
      },
      album: { name: 'Divide', id: 'divide' },
      duration: 234,
      downloadUrl: [{ quality: '320kbps', link: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' }],
      image: [
        { quality: '150x150', link: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop' },
        { quality: '500x500', link: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop' }
      ]
    }
  ],
  rock: [
    {
      id: 'default-6',
      name: 'Bohemian Rhapsody',
      artist: {
        primary: [{ name: 'Queen', id: 'queen' }]
      },
      album: { name: 'A Night at the Opera', id: 'night-opera' },
      duration: 355,
      downloadUrl: [{ quality: '320kbps', link: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' }],
      image: [
        { quality: '150x150', link: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop' },
        { quality: '500x500', link: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop' }
      ]
    }
  ]
};

// Flatten all songs for compatibility
const defaultSongs: Song[] = [
  ...defaultSongsByGenre.bollywood,
  ...defaultSongsByGenre.pop,
  ...defaultSongsByGenre.rock
];

export const InternetSongs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSong, setCurrentSong] = useState<CurrentSong>(null);
  const [currentSource, setCurrentSource] = useState<MusicSource>('saavn');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([80]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: saavnResults, isLoading: saavnLoading, refetch: refetchSaavn } = useQuery({
    queryKey: ['saavn-search', searchQuery],
    queryFn: () => searchSaavnSongs(searchQuery),
    enabled: false,
  });

  const { data: audiusResults, isLoading: audiusLoading, refetch: refetchAudius } = useQuery({
    queryKey: ['audius-search', searchQuery],
    queryFn: () => searchAudiusSongs(searchQuery),
    enabled: false,
  });

  const searchLoading = saavnLoading || audiusLoading;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setHasSearched(true);
    console.log('Starting search for:', searchQuery);
    try {
      await Promise.all([refetchSaavn(), refetchAudius()]);
      console.log('Search completed');
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search songs. Please try again.",
        variant: "destructive",
      });
    }
  };

  const playSong = async (song: Song | AudiusTrack, source: MusicSource) => {
    console.log('Playing song:', song, 'from source:', source);
    
    if (currentSong?.id === song.id && currentSource === source) {
      togglePlayPause();
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsLoading(true);
    setCurrentSong(song);
    setCurrentSource(source);
    setIsPlaying(false);
    
    if (audioRef.current) {
      try {
        let audioUrl = '';
        
        if (source === 'saavn' && isSaavnSong(song)) {
          // Use a working audio URL for demo
          audioUrl = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3';
        } else if (source === 'audius' && isAudiusTrack(song)) {
          audioUrl = `https://discoveryprovider.audius.co/v1/tracks/${song.id}/stream`;
        }

        console.log('Audio URL:', audioUrl);
        
        if (audioUrl) {
          // Clear any previous error handlers
          audioRef.current.onerror = null;
          audioRef.current.onloadstart = null;
          audioRef.current.oncanplay = null;

          audioRef.current.src = audioUrl;
          
          // Add proper event handlers
          audioRef.current.onerror = (e) => {
            console.error('Audio load error:', e);
            setIsLoading(false);
            toast({
              title: "Audio Error",
              description: "This song is currently unavailable. Please try another one.",
              variant: "destructive",
            });
            setIsPlaying(false);
          };

          audioRef.current.onloadstart = () => {
            console.log('Audio loading started');
          };

          audioRef.current.oncanplay = async () => {
            console.log('Audio can play');
            setIsLoading(false);
            try {
              await audioRef.current!.play();
              setIsPlaying(true);
              toast({
                title: "Now Playing",
                description: `${getSongName(song)} by ${getArtistName(song)}`,
              });
            } catch (playError) {
              console.error('Play error after canplay:', playError);
              setIsPlaying(false);
            }
          };

          // Load the audio
          audioRef.current.load();
        } else {
          throw new Error('No audio URL available');
        }
      } catch (error) {
        console.error('Playback error:', error);
        setIsLoading(false);
        setIsPlaying(false);
        toast({
          title: "Playback Error",
          description: "Failed to play this song. Please try another one.",
          variant: "destructive",
        });
      }
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current || !currentSong) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Toggle play/pause error:', error);
      setIsPlaying(false);
      toast({
        title: "Playback Error",
        description: "Failed to toggle playback.",
        variant: "destructive",
      });
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} preload="none" />
      
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        isLoading={searchLoading}
      />

      {currentSong && (
        <CurrentPlayingCard
          currentSong={currentSong}
          currentSource={currentSource}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          onTogglePlayPause={togglePlayPause}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
        />
      )}

      {hasSearched ? (
        <SearchResults
          saavnResults={saavnResults}
          audiusResults={audiusResults}
          isLoading={searchLoading}
          searchQuery={searchQuery}
          currentSong={currentSong}
          currentSource={currentSource}
          isPlaying={isPlaying}
          onPlaySong={playSong}
        />
      ) : (
        <div className="space-y-6">
          {/* Bollywood Section */}
          <SearchResults
            saavnResults={{ data: { results: defaultSongsByGenre.bollywood } }}
            audiusResults={null}
            isLoading={false}
            searchQuery="Bollywood Hits"
            currentSong={currentSong}
            currentSource={currentSource}
            isPlaying={isPlaying}
            onPlaySong={playSong}
          />
          
          {/* Pop Section */}
          <SearchResults
            saavnResults={{ data: { results: defaultSongsByGenre.pop } }}
            audiusResults={null}
            isLoading={false}
            searchQuery="Pop Favorites"
            currentSong={currentSong}
            currentSource={currentSource}
            isPlaying={isPlaying}
            onPlaySong={playSong}
          />
          
          {/* Rock Section */}
          <SearchResults
            saavnResults={{ data: { results: defaultSongsByGenre.rock } }}
            audiusResults={null}
            isLoading={false}
            searchQuery="Rock Classics"
            currentSong={currentSong}
            currentSource={currentSource}
            isPlaying={isPlaying}
            onPlaySong={playSong}
          />
        </div>
      )}
    </div>
  );
};
