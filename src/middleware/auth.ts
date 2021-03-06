import io from 'socket.io';

import { injectable, inject } from '../di';
import { AuthService, SocketService } from '../services';
import { SocketRouteContext } from '../routes/core';

const authSubjects: string[] = [];

@injectable()
export class AuthMiddleware {
  constructor(
    @inject('auth') private auth: AuthService,
    @inject('context') private context: SocketRouteContext,
    @inject('socket') private socket: SocketService,
  ) { }

  static watch(subject: string) {
    authSubjects.push(subject);
  }

  authorize(packet: io.Packet, next: (err?: any) => void): void {
    if (process.env.ALLOW_NO_AUTH || !authSubjects.includes(packet[0])) {
      next();
      return;
    }

    this.auth.auth(this.context.token)
      .then(uwa => {
        next();
      })
      .catch(err => {
        console.log(`[Error] Unauthorized`);
        this.socket.emitError('Unauthorized');
      });
  }
}