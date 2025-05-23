import { Component, OnInit } from '@angular/core';
import { SpotifyService } from 'src/app/services/spotify.service';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: false,
})
export class SearchPage implements OnInit{
  showSearchModal = false;
  searchQuery = '';
  searchResults: any[] = [];
  isSearching = false;

  // Add to playlist
  addToPlaylistModalOpen = false;
  addToPlaylistTrackUri: string | null = null;
  selectedPlaylistsToAdd: Set<string> = new Set();
  userPlaylists: any[] = [];

  constructor(
    private spotifyService: SpotifyService,
    private playerService: PlayerService
  ) {}

  async ngOnInit() {
    this.userPlaylists = await this.spotifyService.getUserPlaylists();
  }

  openSearchModal() {
    this.showSearchModal = true;
    this.searchQuery = '';
    this.searchResults = [];
  }

  closeSearchModal() {
    this.showSearchModal = false;
    this.searchQuery = '';
    this.searchResults = [];
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

  async doSearch() {
    if (!this.searchQuery.trim()) return;
    this.isSearching = true;
    try {
      this.searchResults = await this.spotifyService.search(this.searchQuery);
    } finally {
      this.isSearching = false;
    }
  }

  async playSong(uri: string) {
    await this.playerService.setQueue([uri]);
    await this.playerService.setTrackUri(uri);
    await this.playerService.addTopTracksToQueue(uri);
  }
}