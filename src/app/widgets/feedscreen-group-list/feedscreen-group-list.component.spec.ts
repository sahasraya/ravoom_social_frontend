import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedscreenGroupListComponent } from './feedscreen-group-list.component';

describe('FeedscreenGroupListComponent', () => {
  let component: FeedscreenGroupListComponent;
  let fixture: ComponentFixture<FeedscreenGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedscreenGroupListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeedscreenGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
