import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryTasksComponent } from './delivery-tasks.component';

describe('DeliveryTasksComponent', () => {
  let component: DeliveryTasksComponent;
  let fixture: ComponentFixture<DeliveryTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryTasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
