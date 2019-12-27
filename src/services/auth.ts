import crs from 'crypto-random-string';
import moment from 'moment';

import { User } from '../models';
import { UserService } from '.';
import { injectable, inject } from '../di';

export type UserWithAuth = {
  user: User;
  token: string;
  expires: number;
}

const sessByToken = new Map<string, UserWithAuth>();
const sessById = new Map<string, UserWithAuth>();

function newAuth(user: User): UserWithAuth {
  let token: string;
  do {
    token = crs({ length: 16 });
  } while (sessByToken.has(token))
  const expires = moment().add(4, 'h').valueOf();
  return { user, token, expires };
}

function isExpired(uwa: UserWithAuth): boolean {
  return !uwa || uwa.expires < Date.now();
}

@injectable()
export class AuthServiceMEM implements AuthService {
  constructor(@inject('user') private userService: UserService) {}

  async token(name: string, pass: string): Promise<UserWithAuth> {
    const user = await this.userService.find(name, pass);

    const existing = sessById.get(name);
    if (existing) {
      sessById.delete(existing.user.name);
      sessByToken.delete(existing.token);
    }

    const uwa = newAuth(user);
    sessById.set(uwa.user.name, uwa);
    sessByToken.set(uwa.token, uwa);

    return uwa;
  }

  async auth(token: string): Promise<UserWithAuth> {
    const existing = sessByToken.get(token);
    if (!existing || isExpired(existing)) {
      throw new Error('Unauthorized');
    }

    return existing;
  }

  async invalidate(name: string): Promise<UserWithAuth> {
    const existing = sessById.get(name);
    if (!existing) {
      return undefined;
    }

    sessByToken.delete(existing.token);
    sessById.delete(name);

    existing.token = undefined;
    existing.expires = undefined;

    return existing;
  }
}

export interface AuthService {
  token(name: string, pass: string): Promise<UserWithAuth>;
  auth(token: string): Promise<UserWithAuth>;
  invalidate(name: string): Promise<UserWithAuth>;
}