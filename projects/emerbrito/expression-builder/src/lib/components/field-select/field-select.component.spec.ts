import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldSelectComponent } from './field-select.component';

describe('FieldSelectComponent', () => {
  let component: FieldSelectComponent;
  let fixture: ComponentFixture<FieldSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
