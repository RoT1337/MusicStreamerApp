import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocalMusicPageRoutingModule } from './local-music-routing.module';

import { LocalMusicPage } from './local-music.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocalMusicPageRoutingModule
  ],
  declarations: [LocalMusicPage]
})
export class LocalMusicPageModule {}
