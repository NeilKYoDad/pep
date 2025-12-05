import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebapiTestComponent } from './webapi-test.component';

describe('WebapiTestComponent', () => {
  let component: WebapiTestComponent;
  let fixture: ComponentFixture<WebapiTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebapiTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebapiTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
