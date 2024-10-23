import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkstatusComponent } from './networkstatus.component';

describe('NetworkstatusComponent', () => {
  let component: NetworkstatusComponent;
  let fixture: ComponentFixture<NetworkstatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkstatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NetworkstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
