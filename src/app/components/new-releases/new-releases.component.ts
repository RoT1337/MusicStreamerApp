import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // <-- Add this import
import { SpotifyService } from 'src/app/services/spotify.service';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-new-releases',
  templateUrl: './new-releases.component.html',
  styleUrls: ['./new-releases.component.scss'],
  standalone: false
})
export class NewReleasesComponent implements OnInit {
  albums: any[] = [];
  isLoading = true;

  // Add to playlist modal state
  addToPlaylistModalOpen = false;
  addToPlaylistTrackUri: string | null = null;
  selectedPlaylistsToAdd: Set<string> = new Set();
  userPlaylists: any[] = [];

  constructor(
    private spotifyService: SpotifyService,
    private playerService: PlayerService,
    private router: Router // <-- Inject router here
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    this.albums = await this.spotifyService.getNewReleases();
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

  // --- Add this method for navigation ---
  openAlbum(albumId: string) {
    this.router.navigate(['/tabs/album', albumId]);
  }
}