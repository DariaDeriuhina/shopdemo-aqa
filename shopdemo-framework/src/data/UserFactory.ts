import { randomUUID } from 'node:crypto';
import type { SignupDetails } from '../models/SignupDetails';
import type { UserCredentials } from '../models/UserCredentials';

export class UserFactory {
  static validCredentials(overrides: Partial<UserCredentials> = {}): UserCredentials {
    return { email: 'demo@shopdemo.com', password: 'Demo@123', ...overrides };
  }

  static invalidCredentials(overrides: Partial<UserCredentials> = {}): UserCredentials {
    return { email: 'nonexistent@example.com', password: 'WrongPassword123!', ...overrides };
  }

  static signupDetails(overrides: Partial<SignupDetails> = {}): SignupDetails {
    const password = overrides.password ?? 'SecurePass123!';
    return {
      name: 'Playwright Tester',
      email: `qa-${randomUUID()}@example.com`,
      password,
      confirmPassword: password,
      ...overrides,
    };
  }
}
