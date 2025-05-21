import { Component, OnInit } from '@angular/core';
import { LocalAudioService, LocalTrack, LocalPlaylist } from '../../services/local-audio.service';

@Component({
  selector: 'app-local-music',
  templateUrl: './local-music.page.html',
  styleUrls: ['./local-music.page.scss'],
  standalone: false
})
export class LocalMusicPage implements OnInit {
  playlists: LocalPlaylist[] = [];
  selectedPlaylist: LocalPlaylist | null = null;
  currentTrack: LocalTrack | null = null;
  currentTrackIndex: number = 0;

  constructor(private localAudio: LocalAudioService) {}

  async ngOnInit() {
    await this.localAudio.loadPlaylists();
    this.playlists = this.localAudio.playlists;
  }

  async onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    if (!this.selectedPlaylist) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      this.localAudio.addTrackToPlaylist(this.playlists.indexOf(this.selectedPlaylist), { name: file.name, url });
    }
    await this.localAudio.loadPlaylists();
    this.playlists = this.localAudio.playlists;
  }

  addPlaylist() {
    const name = prompt('Playlist name?');
    if (name) {
      this.localAudio.addPlaylist(name);
      this.playlists = this.localAudio.playlists;
    }
  }

  selectPlaylist(index: number) {
    this.selectedPlaylist = this.playlists[index];
    this.currentTrack = null;
  }

  playTrack(index: number) {
    if (!this.selectedPlaylist) return;
    this.currentTrack = this.selectedPlaylist.tracks[index];
    this.currentTrackIndex = index;
  }

  shuffle(index: number) {
    this.localAudio.shufflePlaylist(index);
    this.playlists = this.localAudio.playlists;
    if (this.selectedPlaylist) {
      this.selectedPlaylist = this.playlists[index];
    }
  }
}