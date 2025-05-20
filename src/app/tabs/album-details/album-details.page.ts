import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyService } from 'src/app/services/spotify.service';
import { Location } from '@angular/common';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-album-details',
  templateUrl: './album-details.page.html',
  styleUrls: ['./album-details.page.scss'],
  standalone: false,
})
export class AlbumDetailsPage implements OnInit {
  albumId: string = '';
  album: any;
  tracks: any[] = [];

  selectedTrackToAdd: any = null;
  showAlbumOptions = false;

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
    this.albumId = this.route.snapshot.paramMap.get('id') || '';
    this.album = await this.spotifyService.getAlbumInfo(this.albumId);
    this.tracks = this.album.tracks.items;
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

  async playAlbum() {
    if (!this.tracks?.length) return;
    const uris = this.tracks.map(track => track.uri);
    const deviceId = localStorage.getItem('spotifyDeviceId');
    if (!deviceId) {
      this.presentToast('No active device found.', 'danger');
      return;
    }
    await this.spotifyService.playUris(uris, deviceId);
  }

  async playTrack(trackUri: string) {
    const deviceId = localStorage.getItem('spotifyDeviceId');
    if (!deviceId) {
      this.presentToast('No active device found.', 'danger');
      return;
    }
    // Use album tracks as the queue
    const uris = this.tracks.map(track => track.uri);
    const startIndex = uris.indexOf(trackUri);
    let playUris: string[] = [];
    if (startIndex > -1) {
      playUris = uris.slice(startIndex).concat(uris.slice(0, startIndex));
    } else {
      playUris = [trackUri];
    }
    await this.spotifyService.playUris(playUris, deviceId);
  }

  openTrackOptions(track: any) {
    this.selectedTrackToAdd = track;
    // Show your playlist selection UI here (e.g., set a flag to show a div or alert)
  }

  async addTrackToPlaylist(playlistId: string) {
    if (!this.selectedTrackToAdd) return;
    await this.spotifyService.addTrackToPlaylist(playlistId, this.selectedTrackToAdd.uri);
    this.selectedTrackToAdd = null;
    // Optionally show a toast/alert for success
  }

  async addAlbumToPlaylist(playlistId: string) {
    if (!this.tracks?.length) return;
    const uris = this.tracks.map(track => track.uri);
    for (const uri of uris) {
      await this.spotifyService.addTrackToPlaylist(playlistId, uri);
    }
    // Optionally show a toast/alert for success
  }

  openAddToPlaylistModal(trackUri: string) {
    this.addToPlaylistTrackUri = trackUri;
    this.selectedPlaylistsToAdd = new Set();
    this.addToPlaylistModalOpen = true;
  }

  openAddAlbumToPlaylistModal() {
    this.addToPlaylistTrackUri = null; // null means "album"
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

  async shuffleAlbum() {
    if (!this.tracks?.length) return;
    const uris = this.tracks.map(track => track.uri);
    const deviceId = localStorage.getItem('spotifyDeviceId');
    if (!deviceId) {
      this.presentToast('No active device found.', 'danger');
      return;
    }
    await this.spotifyService.setShuffle(true, deviceId);
    await this.spotifyService.playUris(uris, deviceId);
  }

  openAlbumOptions() {
    this.showAlbumOptions = true;
  }

  goBack() {
    this.location.back();
  }
}