import { Route, SocketController } from './core';
import { injectable, inject } from '../di';
import { DataService, SocketService } from '../services';

class GetDataMessage {
  id: string;
  type: string;
  bin: boolean;
}

@injectable()
export class DataController extends SocketController {
  constructor(
    @inject('data') private db: DataService,
    @inject('socket') private socket: SocketService,
  ) { super(); }

  @Route('getdata', { auth: true })
  async getdata(m: GetDataMessage): Promise<void> {
    let thing: any;
    switch (m.type) {
      case 'board':
        thing = await this.db.getBoard(m.id);
        break;
      case 'tileset':
        thing = await this.db.getTileset(m.id);
        break;
      case 'asset':
        thing = await this.db.getAsset(m.id, m.bin);
        break;
      default:
        throw new Error(`Unrecognized data type: ${m.type}`);
    }

    if (!thing) {
      throw new Error("No data found");
    }

    this.socket.emit('getdata', thing);
  }
}
