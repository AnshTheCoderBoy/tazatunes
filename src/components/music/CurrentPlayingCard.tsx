
import React from 'react';
import { Play, Pause, Volume2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { CurrentSong, MusicSource } from '@/types/music';
import { getSongImage, getSongName, getArtistName, getAlbumName, formatTime } from '@/utils/musicUtils';

interface CurrentPlayingCardProps {
  currentSong: CurrentSong;
  currentSource: MusicSource;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number[];
  onTogglePlayPause: () => void;
  onSeek: (value: number[]) => void;
  onVolumeChange: (value: number[]) => void;
}

export const CurrentPlayingCard = ({
  currentSong,
  currentSource,
  isPlaying,
  currentTime,
  duration,
  volume,
  onTogglePlayPause,
  onSeek,
  onVolumeChange
}: CurrentPlayingCardProps) => {
  if (!currentSong) return null;

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            {getSongImage(currentSong) ? (
              <img 
                src={getSongImage(currentSong)!} 
                alt={getSongName(currentSong)}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">{getSongName(currentSong)}</h3>
            <p className="text-sm text-gray-400 truncate">{getArtistName(currentSong)}</p>
            <p className="text-xs text-purple-400 truncate">{getAlbumName(currentSong)}</p>
            <p className="text-xs text-green-400">{currentSource === 'audius' ? 'Audius' : 'Saavn'}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            max={100}
            step={0.1}
            onValueChange={onSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Button
            onClick={onTogglePlayPause}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-4"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <Slider
            value={volume}
            max={100}
            step={1}
            onValueChange={onVolumeChange}
            className="flex-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};
