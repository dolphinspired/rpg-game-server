import { Route, SocketController, SocketRouteContext } from './core';
import { UserWithAuth, UserService, SocketService, AuthService } from '../services';
import { injectable, inject } from 'tsyringe';

type AuthMessage = {
  user: string;
  pass: string;
  token: string;
}

@injectable()
export class AccountController extends SocketController {
  constructor(
    @inject('auth') private auth: AuthService,
    @inject('context') private context: SocketRouteContext,
    @inject('socket') private socket: SocketService,
    @inject('user') private users: UserService,
  ) { super(); }

  @Route('signup')
  async signup(m: AuthMessage): Promise<void> {
    const user = await this.users.create(m.user, m.pass);
    if (user) {
      this.socket.emitConsole(`User ${user.name} created`);
    }
  }

  @Route('login')
  async login(m: AuthMessage): Promise<void> {
    let uwa: UserWithAuth;
    if (m.user && m.pass) {
      // If user and pass are provided, log the user in
      uwa = await this.auth.token(m.user, m.pass);
    } else if (m.token) {
      // If a token was provided, the user was previously logged in
      uwa = await this.auth.auth(m.token);
    }

    if (uwa) {
      this.context.player = uwa.user;
      this.context.token = uwa.token;
      this.socket.emit('auth', { token: uwa.token, expires: uwa.expires });
      this.socket.emitConsole(`User ${uwa.user.name} logged in`);
    }
  }

  @Route('logout', { auth: true })
  async logout(m: any): Promise<void> {
    const uwa = await this.auth.invalidate(this.context.player.name);
    if (uwa) {
      this.context.player = null;
      this.context.token = null;
      this.socket.emitConsole(`User ${uwa.user.name} logged out`);
    }
  }

  @Route('refresh', { auth: true })
  async refresh(m: any): Promise<void> {
    await this.auth.invalidate(this.context.player.name);
    const uwa = await this.auth.token(this.context.player.name, this.context.player.pass);
    if (uwa) {
      this.context.player = uwa.user;
      this.context.token = uwa.token;
      this.socket.emit('auth', { token: uwa.token, expires: uwa.expires });
    }
  }
}
