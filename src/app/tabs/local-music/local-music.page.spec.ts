import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalMusicPage } from './local-music.page';

describe('LocalMusicPage', () => {
  let component: LocalMusicPage;
  let fixture: ComponentFixture<LocalMusicPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalMusicPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
