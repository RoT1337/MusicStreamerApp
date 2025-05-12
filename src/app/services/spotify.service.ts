import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private accessToken: string = '';
  private tokenExpiration: number = 0;

  constructor(private http: HttpClient) { }

  async getAccessToken(): Promise<string> {
    const currentTime = Date.now();

    // Check if token is still valid
    if (this.accessToken && currentTime < this.tokenExpiration) {
      return this.accessToken;
    }

    // Headers and body for token request based on Spotify docs
    // Very cool way for api calls using OAuth 2.0 with btoa function for Base64 string encoding
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${environment.spotifyClientId}:${environment.spotifyClientSecret}`)}`
    });

    const body = new URLSearchParams();
    body.set('grant_type', 'client_credentials');

    try {
      // Request new token
      const response: any = await this.http.post(environment.spotifyTokenUrl, body.toString(), { headers })

      // Console log for if token changes
      if (response.access_token !== this.accessToken) {
        console.log('Access token has changed.');
      }

      // Update token and expiration time (Token is 1 hour)
      this.accessToken = response.access_token;
      this.tokenExpiration = currentTime + response.expires_in * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Error fetching access token', error);
      throw error;
    }
  }

  async exchangeCodeForToken(code: string): Promise<void> {
    const body = new URLSearchParams();
    body.set('grant_type', 'authorization_code');
    body.set('code', code);
    body.set('redirect_uri', environment.spotifyRedirectUri);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${environment.spotifyClientId}:${environment.spotifyClientSecret}`)}`,
    });

    try {
      const response: any = await firstValueFrom(
        this.http.post('https://accounts.spotify.com/api/token', body.toString(), { headers })
      );

      localStorage.setItem('spotifyAccessToken', response.access_token);
      localStorage.setItem('spotifyRefreshToken', response.refresh_token);
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  login() {
    const scopes = [
      'playlist-read-private',
      'playlist-read-collaborative'
    ];
    const redirectUri = encodeURIComponent(environment.spotifyRedirectUri);
    const clientId = environment.spotifyClientId;

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scopes.join('%20')}&redirect_uri=${redirectUri}`;

    window.location.href = authUrl; // Spotify Login Page (Authorize)
  }

  async getUserProfile(): Promise<any> {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    if (!accessToken) {
      throw new Error('Access token not found. Please log in.');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    try {
      const response: any = await firstValueFrom(
        this.http.get('https://api.spotify.com/v1/me', { headers })
      );
      return response; // Contains user profile data
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async getUserPlaylists(): Promise<any> {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    if (!accessToken) {
      throw new Error('Access token not found. Please log in.');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    try {
      const response: any = await firstValueFrom(
        this.http.get('https://api.spotify.com/v1/me/playlists', { headers })
      );

      return response.items;
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      throw error;
    }
  }
}
