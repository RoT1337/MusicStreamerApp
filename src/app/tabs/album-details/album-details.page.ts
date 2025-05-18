import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayerService } from 'src/app/services/player.service';
import { SpotifyService } from 'src/app/services/spotify.service';
import { Location } from '@angular/common';

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

  constructor(
    private route: ActivatedRoute, 
    private spotifyService: SpotifyService,
    private playerService: PlayerService,
    private location: Location
  ) {}

  async ngOnInit() {
    this.albumId = this.route.snapshot.paramMap.get('id') || '';
    this.album = await this.spotifyService.getAlbumInfo(this.albumId);
    this.tracks = this.album.tracks.items;
    this.userPlaylists = await this.spotifyService.getUserPlaylists();
  }

  async playAlbum() {
    if (!this.tracks?.length) return;
    const uris = this.tracks.map(track => track.uri);
    await this.playerService.setQueue(uris);
    // await this.playerService.setTrackUri(uris[0]);
  }

  async playTrack(trackUri: string) {
    await this.playerService.setQueue([trackUri]);
    await this.playerService.setTrackUri(trackUri);
    await this.playerService.addTopTracksToQueue(trackUri);
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
    if (this.addToPlaylistTrackUri) {
      // Single track
      for (const playlistId of this.selectedPlaylistsToAdd) {
        await this.spotifyService.addTrackToPlaylist(playlistId, this.addToPlaylistTrackUri);
      }
    } else {
      // Entire album
      const uris = this.tracks.map(track => track.uri);
      for (const playlistId of this.selectedPlaylistsToAdd) {
        for (const uri of uris) {
          await this.spotifyService.addTrackToPlaylist(playlistId, uri);
        }
      }
    }
    this.closeAddToPlaylistModal();
  }

  openAlbumOptions() {
    this.showAlbumOptions = true;
  }

  goBack() {
    this.location.back();
  }
}