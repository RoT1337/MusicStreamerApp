import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  standalone: false
})
export class PlayerComponent implements OnInit, OnChanges {
  @Input() trackUri: string = '';
  @Input() trackName: string = '';
  @Input() trackArtist: string = '';
  @Input() trackImage: string = '';
  isPlaying = false;
  deviceId: string | null = null;

  constructor(private spotifyService: SpotifyService) { }

  ngOnInit() {
    this.initPlayer();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['trackUri'] && this.trackUri) {
      this.fetchTrackInfo();
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

    player.addListener('ready', (e: any) => {
      this.deviceId = e.device_id;
    });

    player.connect();
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