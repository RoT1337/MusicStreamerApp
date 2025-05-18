import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private trackUriSubject = new BehaviorSubject<string | null>(null);
  trackUri$ = this.trackUriSubject.asObservable();

  constructor() {
    this.loadLastTrack();
  }

  async setTrackUri(uri: string) {
    this.trackUriSubject.next(uri);
    await Preferences.set({ key: 'lastTrackUri', value: uri });
  }

  async loadLastTrack() {
    const { value } = await Preferences.get({ key: 'lastTrackUri' });
    console.log(value);
    if (value) {
      this.trackUriSubject.next(value);
    }
  }
}
