import { MessageHandlerContext } from '.';
import { UserWithAuth } from '../services';

type AuthMessage = {
  user: string;
  pass: string;
  token: string;
}

export async function auth(m: AuthMessage, context: MessageHandlerContext): Promise<void> {
  let uwa: UserWithAuth;
  if (m.token) {
    uwa = await context.authService.auth(m.token);
  } else if (m.user && m.pass) {
    uwa = await context.authService.token(m.user, m.pass);
    context.socket.emit('auth', { token: uwa.token })
  } else {
    throw new Error('Unauthorized');
  }

  context.player = uwa.user;
}