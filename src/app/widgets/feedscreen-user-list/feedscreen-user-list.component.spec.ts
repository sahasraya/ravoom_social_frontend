import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedscreenUserListComponent } from './feedscreen-user-list.component';

describe('FeedscreenUserListComponent', () => {
  let component: FeedscreenUserListComponent;
  let fixture: ComponentFixture<FeedscreenUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedscreenUserListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeedscreenUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
