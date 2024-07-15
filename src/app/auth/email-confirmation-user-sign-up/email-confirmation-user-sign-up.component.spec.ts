import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailConfirmationUserSignUpComponent } from './email-confirmation-user-sign-up.component';

describe('EmailConfirmationUserSignUpComponent', () => {
  let component: EmailConfirmationUserSignUpComponent;
  let fixture: ComponentFixture<EmailConfirmationUserSignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailConfirmationUserSignUpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmailConfirmationUserSignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
