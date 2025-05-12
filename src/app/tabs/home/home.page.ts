import { Component, OnInit } from '@angular/core';
import { SpotifyService } from 'src/app/services/spotify.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit{
  breakpoints = {
    320: { spaceBetween: 5, slidesPerView: 3.4 },
    768: { spaceBetween: 15, slidesPerView: 3.5 },
    1024: { spaceBetween: 20, slidesPerView: 4.2 },
  };

  // Current user variables
  userProfileImage: string = '';
  userPlaylists: any[] = [];

  constructor(private spotifyService: SpotifyService) {}

  ngOnInit(): void {
      this.loadUserProfile();
      this.loadCurrentUserPlaylists();
  }

  async loadUserProfile() {
    try {
      const userProfile = await this.spotifyService.getUserProfile();
      this.userProfileImage = userProfile.images?.[0]?.url || ''; // Get the first image URL or fallback to an empty string
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async loadCurrentUserPlaylists() {
    try {
      this.userPlaylists = await this.spotifyService.getUserPlaylists();
    } catch (error) {
      console.error('Error loading user playlists:', error);
    }
  }

  login() {
    this.spotifyService.login();
  }
}
