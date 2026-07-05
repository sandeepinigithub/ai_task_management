import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonDashboard } from './common-dashboard';

describe('CommonDashboard', () => {
  let component: CommonDashboard;
  let fixture: ComponentFixture<CommonDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommonDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(CommonDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
