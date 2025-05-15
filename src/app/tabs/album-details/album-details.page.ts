import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyService } from 'src/app/services/spotify.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-album-details',
  templateUrl: './album-details.page.html',
  styleUrls: ['./album-details.page.scss'],
  standalone: false,
})
export class AlbumDetailsPage implements OnInit {
  albumId: string = '';
  album: any;
  tracks: any[] = [];

  showAlbumOptions = false;
  showTrackOptions = false;

  constructor(
    private route: ActivatedRoute, 
    private spotifyService: SpotifyService,
    private location: Location,
  ) {}

  async ngOnInit() {
    this.albumId = this.route.snapshot.paramMap.get('id') || '';
    this.album = await this.spotifyService.getAlbumInfo(this.albumId);
    this.tracks = this.album.tracks.items;
  }

  openAlbumOptions() {
    this.showAlbumOptions = true;
  }

  openTrackOptions(track: any) {
    this.showTrackOptions = true;
    // Optionally store the selected track for modal actions
  }

  playAlbum() {
    // Implement play album logic
  }

  goBack() {
    this.location.back();
  }
}