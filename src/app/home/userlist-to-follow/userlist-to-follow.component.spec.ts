import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserlistToFollowComponent } from './userlist-to-follow.component';

describe('UserlistToFollowComponent', () => {
  let component: UserlistToFollowComponent;
  let fixture: ComponentFixture<UserlistToFollowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserlistToFollowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserlistToFollowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
