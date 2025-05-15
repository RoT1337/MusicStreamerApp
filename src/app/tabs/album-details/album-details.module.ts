import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AlbumDetailsPageRoutingModule } from './album-details-routing.module';

import { AlbumDetailsPage } from './album-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AlbumDetailsPageRoutingModule
  ],
  declarations: [AlbumDetailsPage]
})
export class AlbumDetailsPageModule {}
