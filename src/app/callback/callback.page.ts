import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.page.html',
  styleUrls: ['./callback.page.scss'],
  standalone: false
})
export class CallbackPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private router: Router,
  ) { }

  ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      this.spotifyService.exchangeCodeForToken(code).then(() => {
        this.router.navigate(['/tabs/home']);
      });
    } else {
      console.error('Authorization code not found in URL');
    }
  }

}
