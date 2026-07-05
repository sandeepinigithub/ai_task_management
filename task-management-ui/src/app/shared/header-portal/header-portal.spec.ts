import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderPortal } from './header-portal';

describe('HeaderPortal', () => {
  let component: HeaderPortal;
  let fixture: ComponentFixture<HeaderPortal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderPortal],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderPortal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
