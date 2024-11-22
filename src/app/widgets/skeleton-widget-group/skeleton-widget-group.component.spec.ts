import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonWidgetGroupComponent } from './skeleton-widget-group.component';

describe('SkeletonWidgetGroupComponent', () => {
  let component: SkeletonWidgetGroupComponent;
  let fixture: ComponentFixture<SkeletonWidgetGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonWidgetGroupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkeletonWidgetGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
