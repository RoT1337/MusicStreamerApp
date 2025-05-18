import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  standalone: false
})
export class PlayerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() trackUri: string = '';
  @Input() trackName: string = '';
  @Input() trackArtist: string = '';
  @Input() trackImage: string = '';

  playerInstance: any = null;

  isPlaying = false;
  loading = false;
  deviceId: string | null = null;
  currentLoadedTrackUri: string | null = null;
  currentPosition: number = 0;
  duration: number = 0;
  progressInterval: any;

  showModal = false;

  constructor(private spotifyService: SpotifyService) { }

  ngOnInit() {
    // Wait for the SDK to be ready
    if ((window as any).Spotify) {
      this.initPlayer();
    } else {
      (window as any).onSpotifyWebPlaybackSDKReady = () => {
        this.initPlayer();
      };
    }
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['trackUri'] && this.trackUri) {
      this.currentPosition = 0;
      this.duration = 0;
      this.isPlaying = false;
      this.loading = true;
      this.fetchTrackInfo();
      this.play();
    }
  }

  ngOnDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    //this.playerModal.dismiss();
  }

  onModalWillDismiss(event: CustomEvent) {
    // Handle any cleanup or state reset if needed
    this.showModal = false;
  }

  startProgressUpdater() {
    this.progressInterval = setInterval(async () => {
      if (this.playerInstance && this.deviceId) {
        if (this.playerInstance.getCurrentState) {
          const state = await this.playerInstance.getCurrentState();
          if (state) {
            this.currentPosition = state.position;
            this.duration = state.duration;
            this.isPlaying = !state.paused;
            this.loading = false;
          } else {
            this.isPlaying = false;
            this.loading = true;
          }
        }
      }
    }, 1000);
  }

  async onSeek(event: any) {
    const value = event.detail.value;
    if (this.playerInstance && this.playerInstance.seek) {
      await this.playerInstance.seek(value);
      this.currentPosition = value;
    } else if (this.deviceId) {
      await this.spotifyService.seekToPosition(value, this.deviceId);
      this.currentPosition = value;
    }
  }

  async fetchTrackInfo() {
    if (this.trackUri) {
      const track = await this.spotifyService.getTrackInfo(this.trackUri);
      this.trackName = track.name;
      this.trackArtist = track.artists[0]?.name;
      this.trackImage = track.album.images[0]?.url;
    }
  }

  initPlayer() {
    const token = localStorage.getItem('spotifyAccessToken');
    const player = new (window as any).Spotify.Player({
      name: 'BeaM Player',
      getOAuthToken: (cb: any) => { cb(token); },
      volume: 0.5
    });

    this.playerInstance = player;

    player.addListener('ready', (e: any) => {
      this.deviceId = e.device_id;
      if (this.deviceId) {
        this.spotifyService.transferPlayback(this.deviceId);
        this.startProgressUpdater();
      }
    });

    player.connect();
  }

  async play() {
    if (this.trackUri && this.deviceId) {
      await this.spotifyService.transferPlayback(this.deviceId);
      if (this.currentLoadedTrackUri === this.trackUri) {
        await this.resume();
      } else {
        await this.spotifyService.playTrack(this.trackUri, this.deviceId);
        this.currentLoadedTrackUri = this.trackUri;
        this.isPlaying = true;
      }
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