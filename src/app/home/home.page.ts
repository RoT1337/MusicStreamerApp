import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  breakpoints = {
    320: { spaceBetween: 5, slidesPerView: 3.4 },
    768: { spaceBetween: 15, slidesPerView: 3.5 },
    1024: { spaceBetween: 20, slidesPerView: 4.2 },
  };

  constructor() {}

}
