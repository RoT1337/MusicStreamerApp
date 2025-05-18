import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private trackUriSubject = new BehaviorSubject<string | null>(null);
  trackUri$ = this.trackUriSubject.asObservable();

  constructor() { }

  setTrackUri(uri: string) {
    this.trackUriSubject.next(uri);
  }
}
