import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultByEnterComponent } from './search-result-by-enter.component';

describe('SearchResultByEnterComponent', () => {
  let component: SearchResultByEnterComponent;
  let fixture: ComponentFixture<SearchResultByEnterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultByEnterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchResultByEnterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
