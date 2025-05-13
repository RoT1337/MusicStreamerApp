import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
  standalone: false
})
export class StartPage implements OnInit {

  constructor(private spotifyService: SpotifyService) { }

  ngOnInit() {
  }

  login() {
    this.spotifyService.login();
  }
}
