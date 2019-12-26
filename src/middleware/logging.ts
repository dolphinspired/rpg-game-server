import io from 'socket.io';

import { injectable, inject } from 'tsyringe';
import { SocketService } from '../services';

@injectable()
export class LoggingMiddleware {
  constructor(
    @inject('socket') private socket: SocketService,
  ) { }

  log(packet: io.Packet, next: (err?: any) => void): void {
    if (process.env.LOG_RECEIVED) {
      console.log(` => Received message for subject: ${packet[0]}`);
    }

    try {
      next();
    } catch (err) {
      console.log(`[Error] ${err.message || err}`);
    }
  }
}