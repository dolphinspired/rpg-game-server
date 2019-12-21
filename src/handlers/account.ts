import { Command, CommandController, MessageHandlerContext } from './command';
import { UserWithAuth } from '../services';

type AuthMessage = {
  user: string;
  pass: string;
  token: string;
}

export class AccountController extends CommandController {
  @Command('signup')
  async signup(m: AuthMessage, c: MessageHandlerContext): Promise<void> {
    const user = await c.userService.create(m.user, m.pass);
    if (user) {
      c.socket.emitConsole(`User ${user.name} created`);
    }
  }

  @Command('login')
  async login(m: AuthMessage, c: MessageHandlerContext): Promise<void> {
    let uwa: UserWithAuth;
    if (m.user && m.pass) {
      // If user and pass are provided, log the user in
      uwa = await c.authService.token(m.user, m.pass);
    } else if (m.token) {
      // If a token was provided, the user was previously logged in
      uwa = await c.authService.auth(m.token);
    }

    if (uwa) {
      c.player = uwa.user;
      c.token = uwa.token;
      c.socket.emit('auth', { token: uwa.token, expires: uwa.expires });
      c.socket.emitConsole(`User ${uwa.user.name} logged in`);
    }
  }

  @Command('logout', { auth: true })
  async logout(m: any, c: MessageHandlerContext): Promise<void> {
    const uwa = await c.authService.invalidate(c.player.name);
    if (uwa) {
      c.player = null;
      c.token = null;
      c.socket.emitConsole(`User ${uwa.user.name} logged out`);
    }
  }

  @Command('refresh', { auth: true })
  async refresh(m: any, c: MessageHandlerContext): Promise<void> {
    await c.authService.invalidate(c.player.name);
    const uwa = await c.authService.token(c.player.name, c.player.pass);
    if (uwa) {
      c.player = uwa.user;
      c.token = uwa.token;
      c.socket.emit('auth', { token: uwa.token, expires: uwa.expires });
    }
  }
}
