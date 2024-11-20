import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonWidgetSearchComponent } from './skeleton-widget-search.component';

describe('SkeletonWidgetSearchComponent', () => {
  let component: SkeletonWidgetSearchComponent;
  let fixture: ComponentFixture<SkeletonWidgetSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonWidgetSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkeletonWidgetSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
