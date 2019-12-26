import { Route, SocketController } from "./core";
import { injectable, inject } from 'tsyringe';
import { SocketService } from '../services';

let count = 0;

@injectable()
export class PingController extends SocketController {
  constructor(@inject('socket') private socket: SocketService) { super(); }

  @Route()
  async pringles(m: any): Promise<void> {
    return this.socket.emitConsole(`Received ping message: ${++count}`);
  }
}