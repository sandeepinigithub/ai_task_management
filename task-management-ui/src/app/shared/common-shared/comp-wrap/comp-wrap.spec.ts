import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompWrap } from './comp-wrap';

describe('CompWrap', () => {
  let component: CompWrap;
  let fixture: ComponentFixture<CompWrap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompWrap],
    }).compileComponents();

    fixture = TestBed.createComponent(CompWrap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
