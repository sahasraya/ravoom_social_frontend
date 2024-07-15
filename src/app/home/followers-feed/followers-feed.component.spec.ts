import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowersFeedComponent } from './followers-feed.component';

describe('FollowersFeedComponent', () => {
  let component: FollowersFeedComponent;
  let fixture: ComponentFixture<FollowersFeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowersFeedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FollowersFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
