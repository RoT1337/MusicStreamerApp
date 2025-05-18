import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayerService } from 'src/app/services/player.service';
import { SpotifyService } from 'src/app/services/spotify.service';
import { Location } from '@angular/common';

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

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private playerService: PlayerService,
    private location: Location
  ) {}

  async ngOnInit() {
    this.playlistId = this.route.snapshot.paramMap.get('id') || '';
    this.playlist = await this.spotifyService.getPlaylistInfo(this.playlistId);
    this.tracks = this.playlist.tracks.items;
    this.userPlaylists = await this.spotifyService.getUserPlaylists();
  }

  async playPlaylist() {
    const uris = this.tracks
      .map(item => item.track?.uri)
      .filter(uri => !!uri);
    if (!uris.length) return;
    await this.playerService.setQueue(uris);
  }

  async playTrack(trackUri: string) {
    if (!trackUri) return;
    await this.playerService.setQueue([trackUri]);
    await this.playerService.setTrackUri(trackUri);
    await this.playerService.addTopTracksToQueue(trackUri);
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
    if (this.addToPlaylistTrackUri) {
      // Single track
      for (const playlistId of this.selectedPlaylistsToAdd) {
        await this.spotifyService.addTrackToPlaylist(playlistId, this.addToPlaylistTrackUri);
      }
    } else {
      // Entire playlist
      const uris = this.tracks
        .map(item => item.track?.uri)
        .filter(uri => !!uri);
      for (const playlistId of this.selectedPlaylistsToAdd) {
        // Add in batches of 100 if needed
        for (let i = 0; i < uris.length; i += 100) {
          await this.spotifyService.addTrackToPlaylist(playlistId, uris.slice(i, i + 100));
        }
      }
    }
    this.closeAddToPlaylistModal();
  }

  async shufflePlaylist() {
    const uris = this.tracks
      .map(item => item.track?.uri)
      .filter(uri => !!uri);
    if (!uris.length) return;
    if (!this.playerService.shuffle) {
      this.playerService.toggleShuffle();
    }
    await this.playerService.setQueue(uris);
  }

  goBack() {
    this.location.back();
  }
}