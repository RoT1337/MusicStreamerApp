import { Component } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { App } from '@capacitor/app';
import { SpotifyService } from './services/spotify.service';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { PlayerService } from './services/player.service';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  selectedTrackUri: string | null = null;
  isLoggedIn = false;

  constructor(
    private spotifyService: SpotifyService, 
    private router: Router,
    private playerService: PlayerService
  ) {
    // Set initial login state
    this.isLoggedIn = !!localStorage.getItem('spotifyAccessToken');

    playerService.trackUri$.subscribe(uri => this.selectedTrackUri = uri);

    App.addListener('appUrlOpen', async (data: any) => {
      if (data.url && data.url.startsWith('beam://callback')) {
        const url = new URL(data.url);
        const code = url.searchParams.get('code');
        if (code) {
          try {
            await spotifyService.exchangeCodeForToken(code);
            this.isLoggedIn = true; // Update login state after login
            this.router.navigate(['/tabs/home']);
          } catch (err) {
            console.error('Token exchange failed', err);
          }
        }
        await Browser.close();
      }
    });
  }

  shouldShowPlayer(): boolean {
    return this.isLoggedIn && !!this.selectedTrackUri && !this.router.url.startsWith('/start');
  }
}