import { Component, Input, OnInit } from '@angular/core';
import { SpotifyService } from 'src/app/services/spotify.service';
import { 
  IonButton,
  IonIcon
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { play, pause, playSkipBack, playSkipForward } from 'ionicons/icons';

declare global {
  interface Window { onSpotifyWebPlaybackSDKReady: any; Spotify: any; }
}

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  imports: [
    IonButton,
    IonIcon
  ]
})
export class PlayerComponent implements OnInit{
  @Input() trackUri: string = '';
  isPlaying = false;
  deviceId: string | null = null;

  constructor(private spotifyService: SpotifyService) {
    addIcons({ play, pause, playSkipBack, playSkipForward });
  }

  ngOnInit() {
    const initPlayer = () => {
      const token = localStorage.getItem('spotifyAccessToken');
      const player = new (window as any).Spotify.Player({
        name: 'BeaM Web Player',
        getOAuthToken: (cb: any) => { cb(token); },
        volume: 0.5
      });

      player.addListener('ready', (e: any) => {
        this.deviceId = e.device_id;
      });

      player.connect();
    };

    if ((window as any).Spotify) {
      initPlayer();
    } else {
      (window as any).onSpotifyWebPlaybackSDKReady = initPlayer;
    }
  }

  async play() {
    if (this.trackUri && this.deviceId) {
      await this.spotifyService.playTrack(this.trackUri, this.deviceId);
      this.isPlaying = true;
    }
  }

  async pause() {
    await this.spotifyService.pausePlayback();
    this.isPlaying = false;
  }

  async resume() {
    await this.spotifyService.resumePlayback();
    this.isPlaying = true;
  }

  async next() {
    await this.spotifyService.nextTrack();
  }

  async previous() {
    await this.spotifyService.previousTrack();
  }
}