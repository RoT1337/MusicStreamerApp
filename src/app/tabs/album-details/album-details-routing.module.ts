import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlbumDetailsPage } from './album-details.page';

const routes: Routes = [
  {
    path: '',
    component: AlbumDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlbumDetailsPageRoutingModule {}
