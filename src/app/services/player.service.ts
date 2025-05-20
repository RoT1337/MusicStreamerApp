import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  // Local playback state (for future use)
  localQueue: string[] = [];
  localQueueIndex: number = 0;
  isLocalPlaying: boolean = false;

  constructor() {}

  setLocalQueue(uris: string[]) {
    this.localQueue = uris;
    this.localQueueIndex = 0;
  }

  playLocal() {
    this.isLocalPlaying = true;
    // Add local audio playback logic here
  }

  pauseLocal() {
    this.isLocalPlaying = false;
    // Add local audio pause logic here
  }

  nextLocal() {
    if (this.localQueueIndex < this.localQueue.length - 1) {
      this.localQueueIndex++;
      this.playLocal();
    }
  }

  previousLocal() {
    if (this.localQueueIndex > 0) {
      this.localQueueIndex--;
      this.playLocal();
    }
  }

  getCurrentLocalTrack() {
    return this.localQueue[this.localQueueIndex];
  }
}