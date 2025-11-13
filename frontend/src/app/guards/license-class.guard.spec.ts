import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { licenseClassGuard } from './license-class.guard';

describe('licenseClassGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => licenseClassGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
