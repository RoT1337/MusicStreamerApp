import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export interface LocalTrack {
  name: string;
  url: string;
  artist?: string;
  album?: string;
  coverUrl?: string;
}

export interface LocalPlaylist {
  name: string;
  tracks: LocalTrack[];
}

@Injectable({
  providedIn: 'root'
})
export class LocalAudioService {
  playlists: LocalPlaylist[] = [];

  async savePlaylists() {
    await Filesystem.writeFile({
      path: 'playlists.json',
      data: JSON.stringify(this.playlists),
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
  }

  async loadPlaylists() {
    try {
      const result = await Filesystem.readFile({
        path: 'playlists.json',
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      if (typeof result.data === 'string') {
        this.playlists = JSON.parse(result.data);
      } else if (result.data instanceof Blob) {
        const text = await result.data.text();
        this.playlists = JSON.parse(text);
      } else {
        this.playlists = [];
      }
    } catch {
      this.playlists = [];
    }
  }

  addPlaylist(name: string) {
    this.playlists.push({ name, tracks: [] });
    this.savePlaylists();
  }

  addTrackToPlaylist(playlistIndex: number, track: LocalTrack) {
    this.playlists[playlistIndex].tracks.push(track);
    this.savePlaylists();
  }

  shufflePlaylist(playlistIndex: number) {
    const tracks = this.playlists[playlistIndex].tracks;
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
    this.savePlaylists();
  }
}