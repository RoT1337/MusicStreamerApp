import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchPageRoutingModule } from './search-routing.module';

import { SearchPage } from './search.page';

import { UserRecommendationsComponent } from 'src/app/components/user-recommendations/user-recommendations.component';
import { NewReleasesComponent } from 'src/app/components/new-releases/new-releases.component';
import { TopSongsComponent } from 'src/app/components/top-songs/top-songs.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchPageRoutingModule
  ],
  declarations: [
    SearchPage, 
    UserRecommendationsComponent,
    NewReleasesComponent,
    TopSongsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SearchPageModule {}
