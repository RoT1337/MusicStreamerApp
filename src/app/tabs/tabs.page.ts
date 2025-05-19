import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../services/spotify.service';
import { ToastController } from '@ionic/angular';

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

  constructor(
    private spotifyService: SpotifyService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
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

  openCreatePlaylistModal() {
    this.showCreatePlaylistModal = true;
  }

  closeCreatePlaylistModal() {
    this.showCreatePlaylistModal = false;
    this.playlistName = '';
    this.playlistDescription = '';
  }

  async createPlaylist() {
    try {
      await this.spotifyService.createPlaylist(this.playlistName, this.playlistDescription);
      this.closeCreatePlaylistModal();
      this.presentToast('Playlist created successfully!');
    } catch (error) {
      this.presentToast('Failed to create playlist.', 'danger');
    }
  }
}
