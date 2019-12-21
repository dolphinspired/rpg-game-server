export type User = {
  name: string;
  pass: string;
}

const users: User[] = [];

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