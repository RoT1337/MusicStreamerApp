import { Component, OnInit } from '@angular/core';
import { SpotifyService } from 'src/app/services/spotify.service';
import { PlayerService } from 'src/app/services/player.service';

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

  constructor(
    private spotifyService: SpotifyService,
    private playerService: PlayerService
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    this.tracks = await this.spotifyService.getUserTopTracks();
    this.userPlaylists = await this.spotifyService.getUserPlaylists();
    this.isLoading = false;
  }

  async playSong(uri: string) {
    await this.playerService.setQueue([uri]);
    await this.playerService.setTrackUri(uri);
    await this.playerService.addTopTracksToQueue(uri);
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