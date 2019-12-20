import crs from 'crypto-random-string';

import { User, UserService } from '.';

const sess = new Map<string, User>();

export class AuthServiceMEM implements AuthService {
  constructor(private userService: UserService) {}

  async token(name: string, pass: string): Promise<string> {
    if (!name || !pass) {
      throw new Error('User name and pass are required');
    }

    const user = await this.userService.find(name, pass);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    let token: string;
    do {
      token = crs({ length: 16 });
    } while (!sess.has(token))

    sess.set(token, user);
    return token;
  }

  async auth(token: string): Promise<User> {
    if (!sess.has(token)) {
      throw new Error('Unauthorized');
    }

    return sess.get(token);
  }
}

export interface AuthService {
  token(name: string, pass: string): Promise<string>;
  auth(token: string): Promise<User>;
}