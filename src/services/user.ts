import { User } from '../models';
import { injectable } from '../di';

const users: User[] = [
  { name: 'dog', pass: 'dog' },
  { name: 'cat', pass: 'cat' }
];

@injectable()
export class UserServiceMEM implements UserService {
  async create(name: string, pass: string): Promise<User> {
    if (!name || !pass) {
      throw new Error('User name and pass are required');
    }
    const existing = users.filter(x => x.name === name);
    if (existing.length) {
      throw new Error(`Username already taken: ${name}`);
    }
    const user = { name, pass };
    users.push(user);
    return user;
  }
  async find(name: string, pass: string): Promise<User> {
    const user = users.filter(x => x.name === name && x.pass === pass)[0];
    if (!user) {
      throw new Error(`Invalid username or password`);
    }
    return user;
  }
}

export interface UserService {
  create(name: string, pass: string): Promise<User>;
  find(name: string, pass: string): Promise<User>;
}