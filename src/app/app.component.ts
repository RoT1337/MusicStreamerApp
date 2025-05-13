import { Component } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { App } from '@capacitor/app';
import { SpotifyService } from './services/spotify.service';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private spotifyService: SpotifyService, private router: Router) {
    App.addListener('appUrlOpen', async (data: any) => {
      if (data.url && data.url.startsWith('beam://callback')) {
        const url = new URL(data.url);
        const code = url.searchParams.get('code');
        if (code) {
          try {
            await spotifyService.exchangeCodeForToken(code);
            this.router.navigate(['/tabs/home']);
          } catch (err) {
            console.error('Token exchange failed', err);
          }
        }
        
        await Browser.close();
      }
    });
  }
}
