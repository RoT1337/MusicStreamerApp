import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-local-player',
  templateUrl: './local-player.component.html',
  styleUrls: ['./local-player.component.scss'],
  standalone: false
})
export class LocalPlayerComponent {
  @Input() track: any;
  @Input() queue: any[] = [];
  @Input() queueIndex: number = 0;

  audio: HTMLAudioElement = new Audio();

  play() {
    this.audio.src = this.track.url;
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  // Add next, previous, seek, etc.
}