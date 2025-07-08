
import { Song, AudiusTrack } from '@/types/music';

export const isSaavnSong = (song: Song | AudiusTrack): song is Song => {
  return 'artist' in song && 'downloadUrl' in song;
};

export const isAudiusTrack = (song: Song | AudiusTrack): song is AudiusTrack => {
  return 'user' in song && 'title' in song;
};

export const getSongImage = (song: Song | AudiusTrack) => {
  if (isSaavnSong(song)) {
    return song.image && song.image.length > 0
      ? song.image.find(img => img.quality === '150x150')?.link || song.image[0]?.link
      : null;
  } else {
    return song.artwork?.["150x150"] || song.artwork?.["480x480"] || null;
  }
};

export const getSongName = (song: Song | AudiusTrack) => {
  return isSaavnSong(song) ? song.name : song.title;
};

export const getArtistName = (song: Song | AudiusTrack) => {
  if (isSaavnSong(song)) {
    return song.artist.primary && song.artist.primary.length > 0 
      ? song.artist.primary.map(a => a.name).join(', ') 
      : 'Unknown Artist';
  } else {
    return song.user.name;
  }
};

export const getAlbumName = (song: Song | AudiusTrack) => {
  return isSaavnSong(song) ? song.album.name : 'Independent Release';
};

export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
