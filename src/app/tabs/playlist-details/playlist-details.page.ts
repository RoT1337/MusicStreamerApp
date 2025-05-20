import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyService } from 'src/app/services/spotify.service';
import { Location } from '@angular/common';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-playlist-details',
  templateUrl: './playlist-details.page.html',
  styleUrls: ['./playlist-details.page.scss'],
  standalone: false,
})
export class PlaylistDetailsPage implements OnInit {
  playlistId: string = '';
  playlist: any;
  tracks: any[] = [];

  addToPlaylistModalOpen = false;
  addToPlaylistTrackUri: string | null = null;
  selectedPlaylistsToAdd: Set<string> = new Set();
  userPlaylists: any[] = [];

  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private location: Location,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    this.playlistId = this.route.snapshot.paramMap.get('id') || '';
    this.playlist = await this.spotifyService.getPlaylistInfo(this.playlistId);
    this.tracks = this.playlist.tracks.items;
    this.userPlaylists = await this.spotifyService.getUserPlaylists();
    this.isLoading = false;
  }

  async presentToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }

  async playPlaylist() {
    const uris = this.tracks
      .map(item => item.track?.uri)
      .filter(uri => !!uri);
    if (!uris.length) return;
    const deviceId = localStorage.getItem('spotifyDeviceId');
    if (!deviceId) {
      this.presentToast('No active device found.', 'danger');
      return;
    }
    await this.spotifyService.playUris(uris, deviceId);
  }

  async playTrack(trackUri: string) {
    if (!trackUri) return;
    const deviceId = localStorage.getItem('spotifyDeviceId');
    if (!deviceId) {
      this.presentToast('No active device found.', 'danger');
      return;
    }
    // Use playlist tracks as the queue
    const uris = this.tracks.map(item => item.track?.uri).filter(uri => !!uri);
    const startIndex = uris.indexOf(trackUri);
    let playUris: string[] = [];
    if (startIndex > -1) {
      playUris = uris.slice(startIndex).concat(uris.slice(0, startIndex));
    } else {
      playUris = [trackUri];
    }
    await this.spotifyService.playUris(playUris, deviceId);
  }

  openAddToPlaylistModal(trackUri: string) {
    this.addToPlaylistTrackUri = trackUri;
    this.selectedPlaylistsToAdd = new Set();
    this.addToPlaylistModalOpen = true;
  }

  openAddPlaylistToPlaylistModal() {
    this.addToPlaylistTrackUri = null; // null means "all tracks"
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
    try {
      if (this.addToPlaylistTrackUri) {
        for (const playlistId of this.selectedPlaylistsToAdd) {
          await this.spotifyService.addTrackToPlaylist(playlistId, this.addToPlaylistTrackUri);
        }
      } else {
        const uris = this.tracks
          .map(item => item.track?.uri ?? item.uri)
          .filter(uri => !!uri);
        for (const playlistId of this.selectedPlaylistsToAdd) {
          for (let i = 0; i < uris.length; i += 100) {
            await this.spotifyService.addTrackToPlaylist(playlistId, uris.slice(i, i + 100));
          }
        }
      }
      this.closeAddToPlaylistModal();
      this.presentToast('Added to playlist!');
    } catch (error) {
      this.presentToast('Failed to add to playlist.', 'danger');
    }
  }

  async shufflePlaylist() {
    const uris = this.tracks
      .map(item => item.track?.uri)
      .filter(uri => !!uri);
    if (!uris.length) return;
    const deviceId = localStorage.getItem('spotifyDeviceId');
    if (!deviceId) {
      this.presentToast('No active device found.', 'danger');
      return;
    }
    await this.spotifyService.setShuffle(true, deviceId);
    await this.spotifyService.playUris(uris, deviceId);
  }

  goBack() {
    this.location.back();
  }
}