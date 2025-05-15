import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlbumDetailsPage } from './album-details.page';

describe('AlbumDetailsPage', () => {
  let component: AlbumDetailsPage;
  let fixture: ComponentFixture<AlbumDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlbumDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
