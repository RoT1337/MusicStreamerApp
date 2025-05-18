import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../services/spotify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
  standalone: false
})
export class StartPage implements OnInit {

  constructor(
    private spotifyService: SpotifyService,
    private router: Router
  ) { }

  ngOnInit() {
    const isLoggedIn = !!localStorage.getItem('spotifyAccessToken');
    if (isLoggedIn) {
      this.router.navigate(['/tabs/home']);
    }
  }

  login() {
    this.spotifyService.login();
  }
}