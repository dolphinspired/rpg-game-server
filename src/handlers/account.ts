import { Command, CommandController, MessageHandlerContext } from './command';
import { UserWithAuth } from '../services';

type AuthMessage = {
  user: string;
  pass: string;
  token: string;
}

export class AccountController extends CommandController {
  @Command('signup')
  async signup(m: AuthMessage): Promise<void> {
    const user = await this.context.userService.create(m.user, m.pass);
    if (user) {
      this.context.socket.emitConsole(`User ${user.name} created`);
    }
  }

  @Command('login')
  async login(m: AuthMessage): Promise<void> {
    let uwa: UserWithAuth;
    if (m.user && m.pass) {
      // If user and pass are provided, log the user in
      uwa = await this.context.authService.token(m.user, m.pass);
    } else if (m.token) {
      // If a token was provided, the user was previously logged in
      uwa = await this.context.authService.auth(m.token);
    }

    if (uwa) {
      this.context.player = uwa.user;
      this.context.token = uwa.token;
      this.context.socket.emit('auth', { token: uwa.token, expires: uwa.expires });
      this.context.socket.emitConsole(`User ${uwa.user.name} logged in`);
    }
  }

  @Command('logout', { auth: true })
  async logout(m: any): Promise<void> {
    const uwa = await this.context.authService.invalidate(this.context.player.name);
    if (uwa) {
      this.context.player = null;
      this.context.token = null;
      this.context.socket.emitConsole(`User ${uwa.user.name} logged out`);
    }
  }

  @Command('refresh', { auth: true })
  async refresh(m: any): Promise<void> {
    await this.context.authService.invalidate(this.context.player.name);
    const uwa = await this.context.authService.token(this.context.player.name, this.context.player.pass);
    if (uwa) {
      this.context.player = uwa.user;
      this.context.token = uwa.token;
      this.context.socket.emit('auth', { token: uwa.token, expires: uwa.expires });
    }
  }
}
