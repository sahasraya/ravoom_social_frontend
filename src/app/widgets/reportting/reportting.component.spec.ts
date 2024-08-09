import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporttingComponent } from './reportting.component';

describe('ReporttingComponent', () => {
  let component: ReporttingComponent;
  let fixture: ComponentFixture<ReporttingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporttingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReporttingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
