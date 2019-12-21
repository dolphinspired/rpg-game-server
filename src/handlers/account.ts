import { MessageHandlerContext } from '.';

type LoginMessage = {
  user: string;
  pass: string;
}

export async function signup(m: LoginMessage, c: MessageHandlerContext): Promise<void> {
  const user = await c.userService.create(m.user, m.pass);
  if (user) {
    c.socket.emitConsole(`User ${user.name} created`);
  }
}

export async function login(m: LoginMessage, c: MessageHandlerContext): Promise<void> {
  const uwa = await c.authService.token(m.user, m.pass);
  if (uwa) {
    c.player = uwa.user;
    c.token = uwa.token;
    c.socket.emit('auth', { token: uwa.token });
    c.socket.emitConsole(`User ${uwa.user.name} logged in`);
  }
}

export async function logout(m: any, c: MessageHandlerContext): Promise<void> {
  const uwa = await c.authService.invalidate(c.player.name);
  if (uwa) {
    c.player = null;
    c.token = null;
    c.socket.emitConsole(`User ${uwa.user.name} logged out`);
  }
}