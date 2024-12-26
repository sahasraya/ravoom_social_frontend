import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleAuthLogInComponent } from './google-auth-log-in.component';

describe('GoogleAuthLogInComponent', () => {
  let component: GoogleAuthLogInComponent;
  let fixture: ComponentFixture<GoogleAuthLogInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleAuthLogInComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoogleAuthLogInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
