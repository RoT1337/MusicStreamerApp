import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpotifyService } from 'src/app/services/spotify.service';

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
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    this.albums = await this.spotifyService.getNewReleases();
    this.userPlaylists = await this.spotifyService.getUserPlaylists();
    this.isLoading = false;
  }

  async playSong(uri: string) {
    const deviceId = localStorage.getItem('spotifyDeviceId');
    if (!deviceId) return;
    await this.spotifyService.playUris([uri], deviceId);
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

  openAlbum(albumId: string) {
    this.router.navigate(['/tabs/album', albumId]);
  }
}