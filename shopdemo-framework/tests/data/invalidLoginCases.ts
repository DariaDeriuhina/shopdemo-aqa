import { UserFactory } from '../../src/data/UserFactory';
import type { UserCredentials } from '../../src/models/UserCredentials';

type InvalidLoginCase = {
  title: string;
  credentials: UserCredentials;
};

export const invalidLoginCases: InvalidLoginCase[] = [
  {
    title: 'nonexistent user',
    credentials: UserFactory.invalidCredentials(),
  },
  {
    title: 'incorrect password',
    credentials: UserFactory.validCredentials({
      password: 'WrongPassword123!',
    }),
  },
];
