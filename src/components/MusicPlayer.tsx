
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Upload, SkipBack, SkipForward, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface MusicFile {
  id: string;
  name: string;
  url: string;
  file: File;
}

export const MusicPlayer = () => {
  const [musicFiles, setMusicFiles] = useState<MusicFile[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([80]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        const musicFile: MusicFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name.replace(/\.[^/.]+$/, ''),
          url,
          file,
        };
        setMusicFiles(prev => [...prev, musicFile]);
        toast({
          title: "Music Added",
          description: `${file.name} has been added to your library`,
        });
      }
    });
  };

  const playTrack = (track: MusicFile) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play();
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (!currentTrack || musicFiles.length === 0) return;
    const currentIndex = musicFiles.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % musicFiles.length;
    playTrack(musicFiles[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentTrack || musicFiles.length === 0) return;
    const currentIndex = musicFiles.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? musicFiles.length - 1 : currentIndex - 1;
    playTrack(musicFiles[prevIndex]);
  };

  const seekTo = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} />
      
      {/* Upload Section */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*"
              multiple
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full transition-all transform hover:scale-105"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Music Files
            </Button>
            <p className="text-gray-400 mt-2">Select multiple audio files from your device</p>
          </div>
        </CardContent>
      </Card>

      {/* Player Controls */}
      {currentTrack && (
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">{currentTrack.name}</h3>
              <div className="text-sm text-gray-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={seekTo}
                className="w-full"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Button
                onClick={playPrevious}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 rounded-full p-2"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                onClick={togglePlayPause}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-3"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <Button
                onClick={playNext}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 rounded-full p-2"
              >
                <SkipForward className="w-5 h-5" />
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

      {/* Music Library */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Music className="w-5 h-5 mr-2" />
            My Library ({musicFiles.length} tracks)
          </h3>
          {musicFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No music files uploaded yet</p>
              <p className="text-sm">Upload some music to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {musicFiles.map((track) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-white/10 ${
                    currentTrack?.id === track.id ? 'bg-purple-600/20 border border-purple-500/30' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{track.name}</p>
                      <p className="text-sm text-gray-400">Local file</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    {currentTrack?.id === track.id && isPlaying ? 
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
