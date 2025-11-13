import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerGuideComponent } from './answer-guide.component';

describe('AnswerGuideComponent', () => {
  let component: AnswerGuideComponent;
  let fixture: ComponentFixture<AnswerGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnswerGuideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnswerGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
