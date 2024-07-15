import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPostGroupComponent } from './add-post-group.component';

describe('AddPostGroupComponent', () => {
  let component: AddPostGroupComponent;
  let fixture: ComponentFixture<AddPostGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPostGroupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPostGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
