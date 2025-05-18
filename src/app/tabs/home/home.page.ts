import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from 'src/app/services/player.service';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit{
  breakpoints = {
    320: { spaceBetween: 5, slidesPerView: 3.4 },
    768: { spaceBetween: 15, slidesPerView: 3.5 },
    1024: { spaceBetween: 20, slidesPerView: 4.2 },
  };

  // Add song/track to playlist modal
  addToPlaylistModalOpen = false;
  addToPlaylistTrackUri: string | null = null;
  selectedPlaylistsToAdd: Set<string> = new Set();

  // Is section loading?
  isLoadingQuickPicks = true;
  isLoadingAlbums = true;
  isLoadingPlaylists = true;
  isLoadingRecentPlaylist = true;

  // Current user variables
  userProfileImage: string = '';
  userPlaylists: any[] = [];
  recentPlaylists: any[] = [];

  // Song variables
  quickPicks: any[] = [];
  selectedTrackUri = this.playerService.trackUri$;

  // Album variables
  quickPickAlbums: any[] = [];

  // HTML
  hideHeader = false;
  lastScrollTop = 0;

  constructor(
    private spotifyService: SpotifyService,
    private router: Router,
    private playerService: PlayerService
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

  async loadUserProfile() {
    try {
      const userProfile = await this.spotifyService.getUserProfile();
      this.userProfileImage = userProfile.images?.[0]?.url || ''; // Get the first image URL or fallback to an empty string
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async loadRecentPlaylists() {
    this.isLoadingRecentPlaylist = true;
    try {
      // Get current user profile to get their user ID
      const userProfile = await this.spotifyService.getUserProfile();
      const myUserId = userProfile.id;

      // Get all playlists (owned and followed)
      const allPlaylists = await this.spotifyService.getUserPlaylists();

      // Filter playlists where the owner is the current user
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
      // Remove duplicates by track id
      this.quickPicks = quickPicks.filter(
        (track, index, self) => index === self.findIndex(t => t.id === track.id)
      ).slice(0, 12); // Limit to 12 tracks for display
    } catch (error) {
      console.error('Error loading quick picks:', error);
    } finally {
      this.isLoadingQuickPicks = false;
    }
  }

  async loadQuickPickAlbums() {
    this.isLoadingAlbums = true;
    try {
      // Get top artists for both short and long term
      const shortTermArtists = await this.spotifyService.getUserTopArtists('short_term');
      const longTermArtists = await this.spotifyService.getUserTopArtists('long_term');
      const allArtists = [...shortTermArtists, ...longTermArtists];

      let albums: any[] = [];
      for (const artist of allArtists) {
        const artistAlbums = await this.spotifyService.getArtistAlbums(artist.id);
        albums = albums.concat(artistAlbums);
      }

      // Remove duplicate albums by id
      this.quickPickAlbums = albums.filter(
        (album, index, self) => index === self.findIndex(a => a.id === album.id)
      ).slice(0, 12); // Limit for display
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
    console.log('Selected track URI:', uri);
    await this.playerService.setQueue([uri]);
    await this.playerService.setTrackUri(uri);
    await this.playerService.addTopTracksToQueue(uri);
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
    if (!this.addToPlaylistTrackUri) return;
    for (const playlistId of this.selectedPlaylistsToAdd) {
      await this.spotifyService.addTrackToPlaylist(playlistId, this.addToPlaylistTrackUri);
    }
    this.closeAddToPlaylistModal();
  }
}
