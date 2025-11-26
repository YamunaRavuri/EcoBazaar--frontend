import { TestBed } from '@angular/core/testing';

import { UserReport } from './user-report';

describe('UserReport', () => {
  let service: UserReport;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserReport);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
