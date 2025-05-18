import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { SpotifyService } from 'src/app/services/spotify.service';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  standalone: false
})
export class PlayerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() trackUri: string | null = null;
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

  shuffle = false;

  // Queue
  showQueueModal = false;
  queue: string[] = [];
  queueSub?: Subscription;
  trackDetails: { [uri: string]: any } = {};
  queueIndex: number = 0;
  queueIndexSub?: Subscription;

  constructor(
    private spotifyService: SpotifyService,
    private playerService: PlayerService
  ) { }

  ngOnInit() {
    // Wait for the SDK to be ready
    if ((window as any).Spotify) {
      this.initPlayer();
    } else {
      (window as any).onSpotifyWebPlaybackSDKReady = () => {
        this.initPlayer();
      };
    }

    this.queueSub = this.playerService.queue$.subscribe(q => {
      this.queue = q;
      // Fetch track details for all URIs in the queue
      q.forEach(uri => {
        if (!this.trackDetails[uri]) {
          this.spotifyService.getTrackInfo(uri).then(info => {
            this.trackDetails[uri] = info;
          });
        }
      });
    });

    this.queueIndexSub = this.playerService.queueIndex$.subscribe(idx => {
      this.queueIndex = idx;
    });

    this.shuffle = this.playerService.shuffle;
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
    this.queueSub?.unsubscribe();
    this.queueIndexSub?.unsubscribe();
  }

  get currentIndex(): number {
    return this.queueIndex;
  }

  get previousTrackUri(): string | null {
    return this.currentIndex > 0 ? this.queue[this.currentIndex - 1] : null;
  }

  get nextTrackUri(): string | null {
    return this.currentIndex < this.queue.length - 1 ? this.queue[this.currentIndex + 1] : null;
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    //this.playerModal.dismiss();
  }

  getTrackImage(uri: string) {
    return this.trackDetails[uri]?.album?.images?.[0]?.url || '';
  }
  
  getTrackName(uri: string) {
    return this.trackDetails[uri]?.name || '';
  }

  getTrackArtist(uri: string) {
    return this.trackDetails[uri]?.artists?.[0]?.name || '';
  } 

  openQueueModal() {
    this.showQueueModal = true;
  }

  closeQueueModal() {
    this.showQueueModal = false;
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
            // If track ended, go to next
            if (state.position >= state.duration && !state.paused) {
              this.playerService.nextTrack();
            }
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
    this.playerService.nextTrack();
  }

  async previous() {
    this.playerService.previousTrack();
  }

  toggleShuffle() {
    this.playerService.toggleShuffle();
    this.shuffle = this.playerService.shuffle;
  }
}