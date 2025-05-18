import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { SpotifyService } from './spotify.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private trackUriSubject = new BehaviorSubject<string | null>(null);
  trackUri$ = this.trackUriSubject.asObservable();

  // Current Queue
  private queueSubject = new BehaviorSubject<string[]>([]);
  queue$ = this.queueSubject.asObservable();

  // Previously Played Queue
  private queueIndexSubject = new BehaviorSubject<number>(0);
  queueIndex$ = this.queueIndexSubject.asObservable();

  constructor(private spotifyService: SpotifyService) {
    this.loadLastTrack();
  }
  
  async addTopTracksToQueue(currentTrackUri: string) {
    // Fetch user's top tracks
    const topTracks = await this.spotifyService.getUserTopTracks();
    // Filter out the current track and any already in the queue
    const currentQueue = this.queueSubject.value;
    const urisToAdd = topTracks
      .map(track => track.uri)
      .filter(uri => uri !== currentTrackUri && !currentQueue.includes(uri));
    // Add to queue
    this.queueSubject.next([...currentQueue, ...urisToAdd]);
  }

  async setTrackUri(uri: string) {
    this.trackUriSubject.next(uri);
    await Preferences.set({ key: 'lastTrackUri', value: uri });
  }

  async loadLastTrack() {
    const { value } = await Preferences.get({ key: 'lastTrackUri' });
    if (value) {
      this.trackUriSubject.next(value);
    }
  }

  async setQueue(uris: string[]) {
    this.queueSubject.next(uris);
    this.queueIndexSubject.next(0);
    this.setTrackUri(uris[0]);
  }

  addToQueue(uri: string) {
    const current = this.queueSubject.value;
    this.queueSubject.next([...current, uri]);
  }

  async nextTrack() {
    const queue = this.queueSubject.value;
    let idx = this.queueIndexSubject.value;
    if (idx < queue.length - 1) {
      idx++;
      this.queueIndexSubject.next(idx);
      this.setTrackUri(queue[idx]);
    } else if (queue.length === 1 || idx === queue.length - 1) {
      // Last song, add top tracks for continuity
      await this.addTopTracksToQueue(queue[idx]);
      const updatedQueue = this.queueSubject.value;
      if (updatedQueue.length > queue.length) {
        idx++;
        this.queueIndexSubject.next(idx);
        this.setTrackUri(updatedQueue[idx]);
      }
    }
  }

  async previousTrack() {
    const queue = this.queueSubject.value;
    let idx = this.queueIndexSubject.value;
    if (idx > 0) {
      idx--;
      this.queueIndexSubject.next(idx);
      this.setTrackUri(queue[idx]);
    }
  }

  getQueueIndexSubject() {
    return this.queueIndexSubject;
  }
}