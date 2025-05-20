import { Component, OnInit } from '@angular/core';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-top-songs',
  templateUrl: './top-songs.component.html',
  styleUrls: ['./top-songs.component.scss'],
  standalone: false,
})
export class TopSongsComponent implements OnInit {
  tracks: any[] = [];
  isLoading = true;

  // Add to playlist modal state
  addToPlaylistModalOpen = false;
  addToPlaylistTrackUri: string | null = null;
  selectedPlaylistsToAdd: Set<string> = new Set();
  userPlaylists: any[] = [];

  constructor(private spotifyService: SpotifyService) {}

  async ngOnInit() {
    this.isLoading = true;
    this.tracks = await this.spotifyService.getUserTopTracks();
    this.userPlaylists = await this.spotifyService.getUserPlaylists();
    this.isLoading = false;
  }

  async playSong(uri: string) {
    const deviceId = localStorage.getItem('spotifyDeviceId');
    if (!deviceId) return;
    // Use top songs as the queue
    const uris = this.tracks.map(track => track.uri);
    const startIndex = uris.indexOf(uri);
    let playUris: string[] = [];
    if (startIndex > -1) {
      playUris = uris.slice(startIndex).concat(uris.slice(0, startIndex));
    } else {
      playUris = [uri];
    }
    await this.spotifyService.playUris(playUris, deviceId);
  }

  openAddToPlaylistModal(trackUri: string) {
    this.addToPlaylistTrackUri = trackUri;
    this.selectedPlaylistsToAdd = new Set();
    this.addToPlaylistModalOpen = true;
  }

  closeAddToPlaylistModal() {
    this.addToPlaylistModalOpen = false;
    this.addToPlaylistTrackUri = null;
    this.selectedPlaylistsToAdd.clear();
  }

  togglePlaylistSelection(playlistId: string) {
    if (this.selectedPlaylistsToAdd.has(playlistId)) {
      this.selectedPlaylistsToAdd.delete(playlistId);
    } else {
      this.selectedPlaylistsToAdd.add(playlistId);
    }
  }

  async addTrackToSelectedPlaylists() {
    if (!this.addToPlaylistTrackUri) return;
    for (const playlistId of this.selectedPlaylistsToAdd) {
      await this.spotifyService.addTrackToPlaylist(playlistId, this.addToPlaylistTrackUri);
    }
    this.closeAddToPlaylistModal();
  }
}