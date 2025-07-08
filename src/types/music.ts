
export interface Song {
  id: string;
  name: string;
  artist: {
    primary?: Array<{
      name: string;
      id: string;
    }>;
  };
  album: {
    name: string;
    id: string;
  };
  duration: number;
  downloadUrl: Array<{
    quality: string;
    link: string;
  }>;
  image: Array<{
    quality: string;
    link: string;
  }>;
}

export interface SearchResponse {
  data: {
    results: Song[];
  };
}

export interface AudiusTrack {
  id: string;
  title: string;
  user: {
    name: string;
  };
  duration: number;
  artwork?: {
    "150x150"?: string;
    "480x480"?: string;
  };
  stream_url?: string;
}

export interface AudiusResponse {
  data: AudiusTrack[];
}

export type MusicSource = 'saavn' | 'audius';
export type CurrentSong = Song | AudiusTrack | null;
