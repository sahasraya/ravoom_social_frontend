import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonWidgetPopularGroupsAndUsersComponent } from './skeleton-widget-popular-groups-and-users.component';

describe('SkeletonWidgetPopularGroupsAndUsersComponent', () => {
  let component: SkeletonWidgetPopularGroupsAndUsersComponent;
  let fixture: ComponentFixture<SkeletonWidgetPopularGroupsAndUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonWidgetPopularGroupsAndUsersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkeletonWidgetPopularGroupsAndUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
