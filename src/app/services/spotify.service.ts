import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
import { Browser } from '@capacitor/browser';

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

  async login() {
    const scopes = [
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-top-read',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'streaming'
    ];
    const redirectUri = encodeURIComponent(environment.spotifyRedirectUri);
    const clientId = environment.spotifyClientId;

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scopes.join('%20')}&redirect_uri=${redirectUri}`;

    // window.location.href = authUrl; // Spotify Login Page (Authorize)
    
    await Browser.open({ url: authUrl });
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

  // Get user's top artists for a given time range
  async getUserTopArtists(time_range: 'short_term' | 'long_term' = 'short_term'): Promise<any[]> {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
    const response: any = await firstValueFrom(
      this.http.get(`https://api.spotify.com/v1/me/top/artists?limit=5&time_range=${time_range}`, { headers })
    );
    return response.items;
  }

  // Get albums for an artist
  async getArtistAlbums(artistId: string): Promise<any[]> {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
    const response: any = await firstValueFrom(
      this.http.get(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=5`, { headers })
    );
    return response.items;
  }

  // Search for albums
  async searchAlbums(query: string): Promise<any[]> {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
    const response: any = await firstValueFrom(
      this.http.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=10`, { headers })
    );
    return response.albums.items;
  }

  async searchTracksByArtist(artistName: string): Promise<any[]> {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
    const response: any = await firstValueFrom(
      this.http.get(
        `https://api.spotify.com/v1/search?q=artist:${encodeURIComponent(artistName)}&type=track&limit=4`,
        { headers }
      )
    );
    return response.tracks.items;
  }

  async getTrackInfo(trackUri: string): Promise<any> {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    if (!accessToken) {
      throw new Error('Access token not found. Please log in.');
    }

    // Extract the track ID from the URI (format: "spotify:track:TRACK_ID")
    let trackId = trackUri;
    if (trackUri.startsWith('spotify:track:')) {
      trackId = trackUri.split(':')[2];
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    try {
      const response: any = await firstValueFrom(
        this.http.get(`https://api.spotify.com/v1/tracks/${trackId}`, { headers })
      );
      return response;
    } catch (error) {
      console.error('Error fetching track info:', error);
      throw error;
    }
  }

  async getAlbumInfo(albumId: string): Promise<any> {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
    return firstValueFrom(this.http.get(`https://api.spotify.com/v1/albums/${albumId}`, { headers }));
  }

  async getPlaylistInfo(playlistId: string): Promise<any> {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
    return firstValueFrom(this.http.get(`https://api.spotify.com/v1/playlists/${playlistId}`, { headers }));
  }

  async playTrack(trackUri: string, deviceId: string): Promise<void> {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });
    await firstValueFrom(
      this.http.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        { uris: [trackUri] },
        { headers }
      )
    );
  }

async pausePlayback(): Promise<void> {
  const accessToken = localStorage.getItem('spotifyAccessToken');
  const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
  await firstValueFrom(
    this.http.put('https://api.spotify.com/v1/me/player/pause', {}, { headers })
  );
}

async resumePlayback(): Promise<void> {
  // Resume is just play with no body
  const accessToken = localStorage.getItem('spotifyAccessToken');
  const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
  await firstValueFrom(
    this.http.put('https://api.spotify.com/v1/me/player/play', {}, { headers })
  );
}

async nextTrack(): Promise<void> {
  const accessToken = localStorage.getItem('spotifyAccessToken');
  const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
  await firstValueFrom(
    this.http.post('https://api.spotify.com/v1/me/player/next', {}, { headers })
  );
}

async previousTrack(): Promise<void> {
  const accessToken = localStorage.getItem('spotifyAccessToken');
  const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
  await firstValueFrom(
    this.http.post('https://api.spotify.com/v1/me/player/previous', {}, { headers })
  );
}
}
