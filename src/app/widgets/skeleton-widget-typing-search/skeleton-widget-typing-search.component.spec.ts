import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonWidgetTypingSearchComponent } from './skeleton-widget-typing-search.component';

describe('SkeletonWidgetTypingSearchComponent', () => {
  let component: SkeletonWidgetTypingSearchComponent;
  let fixture: ComponentFixture<SkeletonWidgetTypingSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonWidgetTypingSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkeletonWidgetTypingSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
