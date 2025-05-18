import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: false
})
export class TabsPage implements OnInit {
  selectedTrackUri: string = ''; 

  // Create a playlist
  showCreatePlaylistModal = false;
  playlistName = '';
  playlistDescription = '';

  constructor(private spotifyService: SpotifyService) { }

  ngOnInit() {
  }

  openCreatePlaylistModal() {
    this.showCreatePlaylistModal = true;
  }

  closeCreatePlaylistModal() {
    this.showCreatePlaylistModal = false;
    this.playlistName = '';
    this.playlistDescription = '';
  }

  async createPlaylist() {
    await this.spotifyService.createPlaylist(this.playlistName, this.playlistDescription);
    this.closeCreatePlaylistModal();
  }
}
