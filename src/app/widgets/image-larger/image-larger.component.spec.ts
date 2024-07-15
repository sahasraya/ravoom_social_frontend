import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageLargerComponent } from './image-larger.component';

describe('ImageLargerComponent', () => {
  let component: ImageLargerComponent;
  let fixture: ComponentFixture<ImageLargerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageLargerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImageLargerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
