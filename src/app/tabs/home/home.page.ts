import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpotifyService } from 'src/app/services/spotify.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  breakpoints = {
    320: { spaceBetween: 5, slidesPerView: 3.4 },
    768: { spaceBetween: 15, slidesPerView: 3.5 },
    1024: { spaceBetween: 20, slidesPerView: 4.2 },
  };

  addToPlaylistModalOpen = false;
  addToPlaylistTrackUri: string | null = null;
  selectedPlaylistsToAdd: Set<string> = new Set();

  isLoadingQuickPicks = true;
  isLoadingAlbums = true;
  isLoadingPlaylists = true;
  isLoadingRecentPlaylist = true;

  userProfileImage: string = '';
  userPlaylists: any[] = [];
  recentPlaylists: any[] = [];
  quickPicks: any[] = [];
  quickPickAlbums: any[] = [];
  selectedTrackUri: string | null = null;

  hideHeader = false;
  lastScrollTop = 0;

  constructor(
    private spotifyService: SpotifyService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('spotifyAccessToken');
    if (!token) {
      this.router.navigate(['/start']);
      return;
    }
    this.loadUserProfile();
    this.loadCurrentUserPlaylists();
    this.loadQuickPicks();
    this.loadQuickPickAlbums();
    this.loadRecentPlaylists();
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

  async loadUserProfile() {
    try {
      const userProfile = await this.spotifyService.getUserProfile();
      this.userProfileImage = userProfile.images?.[0]?.url || '';
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async loadRecentPlaylists() {
    this.isLoadingRecentPlaylist = true;
    try {
      const userProfile = await this.spotifyService.getUserProfile();
      const myUserId = userProfile.id;
      const allPlaylists = await this.spotifyService.getUserPlaylists();
      this.recentPlaylists = allPlaylists.filter((playlist: any) => playlist.owner.id === myUserId);
    } catch (error) {
      console.error('Error loading your playlists:', error);
      this.recentPlaylists = [];
    } finally {
      this.isLoadingRecentPlaylist = false;
    }
  }

  async loadCurrentUserPlaylists() {
    this.isLoadingPlaylists = true;
    try {
      this.userPlaylists = await this.spotifyService.getUserPlaylists();
    } catch (error) {
      console.error('Error loading user playlists:', error);
    } finally {
      this.isLoadingPlaylists = false;
    }
  }

  async loadQuickPicks() {
    this.isLoadingQuickPicks = true;
    try {
      const topArtists = await this.spotifyService.getUserTopArtists();
      let quickPicks: any[] = [];
      for (const artist of topArtists) {
        const tracks = await this.spotifyService.searchTracksByArtist(artist.name);
        quickPicks = quickPicks.concat(tracks);
      }
      this.quickPicks = quickPicks.filter(
        (track, index, self) => index === self.findIndex(t => t.id === track.id)
      ).slice(0, 12);
    } catch (error) {
      console.error('Error loading quick picks:', error);
    } finally {
      this.isLoadingQuickPicks = false;
    }
  }

  async loadQuickPickAlbums() {
    this.isLoadingAlbums = true;
    try {
      const shortTermArtists = await this.spotifyService.getUserTopArtists('short_term');
      const longTermArtists = await this.spotifyService.getUserTopArtists('long_term');
      const allArtists = [...shortTermArtists, ...longTermArtists];
      let albums: any[] = [];
      for (const artist of allArtists) {
        const artistAlbums = await this.spotifyService.getArtistAlbums(artist.id);
        albums = albums.concat(artistAlbums);
      }
      this.quickPickAlbums = albums.filter(
        (album, index, self) => index === self.findIndex(a => a.id === album.id)
      ).slice(0, 12);
    } catch (error) {
      console.error('Error loading quick pick albums:', error);
    } finally {
      this.isLoadingAlbums = false;
    }
  }

  openAlbum(albumId: string) {
    this.router.navigate(['tabs/album', albumId]);
  }

  async playSong(uri: string) {
    const deviceId = localStorage.getItem('spotifyDeviceId');
    if (!deviceId) {
      this.presentToast('No active device found.', 'danger');
      return;
    }
    // Use quickPicks as the queue
    const uris = this.quickPicks.map(track => track.uri);
    const startIndex = uris.indexOf(uri);
    let playUris: string[] = [];
    if (startIndex > -1) {
      playUris = uris.slice(startIndex).concat(uris.slice(0, startIndex));
    } else {
      playUris = [uri];
    }
    await this.spotifyService.playUris(playUris, deviceId);
    this.selectedTrackUri = uri;
  }

  login() {
    this.spotifyService.login();
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
    try {
      if (!this.addToPlaylistTrackUri) return;
      for (const playlistId of this.selectedPlaylistsToAdd) {
        await this.spotifyService.addTrackToPlaylist(playlistId, this.addToPlaylistTrackUri);
      }
      this.closeAddToPlaylistModal();
      this.presentToast('Track added to playlist!');
    } catch (error) {
      this.presentToast('Failed to add track to playlist.', 'danger');
    }
  }

  openPlaylist(playlistId: string) {
    this.router.navigate(['tabs/playlist', playlistId]);
  }
}