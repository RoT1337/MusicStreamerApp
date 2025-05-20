import { Component, OnInit, OnDestroy } from '@angular/core';
import { SpotifyService } from 'src/app/services/spotify.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  standalone: false
})
export class PlayerComponent implements OnInit, OnDestroy {
  
  // Player check
  state: any = null;
  playerInstance: any = null;
  isPlaying = false;
  loading = false;
  deviceId: string | null = null;

  // Progress bar
  currentPosition: number = 0;
  duration: number = 0;

  // Track meta-data
  trackName: string = '';
  trackArtist: string = '';
  trackImage: string = '';

  // Player features
  repeatMode: 'off' | 'context' | 'track' = 'off';
  shuffle = false;
  progressInterval: any;
  previousTrack: any = null;
  nextTrack: any = null;

  // Modals
  showModal = false;
  showQueueModal = false;

  queue: any[] = [];

  constructor(
    private spotifyService: SpotifyService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    if ((window as any).Spotify) {
      this.initPlayer();
    } else {
      (window as any).onSpotifyWebPlaybackSDKReady = () => {
        this.initPlayer();
      };
    }
  }

  ngOnDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    if (this.playerInstance) {
      this.playerInstance.disconnect();
    }
  }

  async syncPlayerState() {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    if (!accessToken) return;
    const headers = new Headers({ Authorization: `Bearer ${accessToken}` });

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', { headers });
      if (!response.ok) return;
      const data = await response.json();
      this.shuffle = !!data.shuffle_state;
      this.repeatMode = data.repeat_state as 'off' | 'context' | 'track';
    } catch (err) {
      // Optionally handle error
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
        localStorage.setItem('spotifyDeviceId', this.deviceId);
        this.spotifyService.transferPlayback(this.deviceId);
        this.startProgressUpdater();
        this.syncPlayerState(); // <-- Sync shuffle/repeat state on ready
      }
    });

    player.addListener('player_state_changed', (state: any) => {
      if (!state) return;
      this.state = state;
      const track = state.track_window.current_track;
      this.trackName = track?.name || '';
      this.trackArtist = track?.artists?.[0]?.name || '';
      this.trackImage = track?.album?.images?.[0]?.url || '';
      this.currentPosition = state.position;
      this.duration = state.duration;
      this.isPlaying = !state.paused;
      this.loading = false;

      // Queue and thumbs
      const prev = state.track_window.previous_tracks;
      const next = state.track_window.next_tracks;
      this.previousTrack = prev && prev.length ? prev[prev.length - 1] : null;
      this.nextTrack = next && next.length ? next[0] : null;
      this.queue = [
        ...(prev || []),
        track,
        ...(next || [])
      ];
    });

    player.connect();
  }

  getTrackImage(track: any): string {
    return track?.album?.images?.[0]?.url || '';
  }
  getTrackName(track: any): string {
    return track?.name || '';
  }
  getTrackArtist(track: any): string {
    return track?.artists?.[0]?.name || '';
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

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onModalWillDismiss(event: any) {
    this.showModal = false;
  }

  async openQueueModal() {
    this.showQueueModal = true;
    try {
      const queueData = await this.spotifyService.getPlaybackQueue();
      this.queue = [
        queueData.currently_playing,
        ...(queueData.queue || [])
      ];
    } catch (e) {
      // Fallback to SDK window
      await this.presentToast('Could not load full queue. Showing limited queue.', 'warning');
      if (this.state) {
        const prev = this.state.track_window.previous_tracks;
        const track = this.state.track_window.current_track;
        const next = this.state.track_window.next_tracks;
        this.queue = [
          ...(prev || []),
          track,
          ...(next || [])
        ];
      } else {
        this.queue = [];
      }
    }
  }

  async presentToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }

  closeQueueModal() {
    this.showQueueModal = false;
  }

  async play() {
    if (this.playerInstance) {
      await this.playerInstance.resume();
    }
  }

  async pause() {
    if (this.playerInstance) {
      await this.playerInstance.pause();
    }
  }

  async next() {
    if (this.playerInstance) {
      await this.playerInstance.nextTrack();
    }
  }

  async previous() {
    if (this.playerInstance) {
      await this.playerInstance.previousTrack();
    }
  }

  async onSeek(event: any) {
    const value = event.detail.value;
    if (this.playerInstance && this.playerInstance.seek) {
      await this.playerInstance.seek(value);
      this.currentPosition = value;
    }
  }

  async toggleShuffle() {
    if (this.deviceId) {
      this.shuffle = !this.shuffle;
      await this.spotifyService.setShuffle(this.shuffle, this.deviceId);
    }
  }

  async toggleRepeat() {
    if (this.deviceId) {
      if (this.repeatMode === 'off') {
        this.repeatMode = 'context';
      } else if (this.repeatMode === 'context') {
        this.repeatMode = 'track';
      } else {
        this.repeatMode = 'off';
      }
      await this.spotifyService.setRepeat(this.repeatMode, this.deviceId);
    }
  }
}