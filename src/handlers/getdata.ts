import { Command, CommandController, MessageHandlerContext } from './command';

class GetDataMessage {
  id: string;
  type: string;
  bin: boolean;
}

export class DataController extends CommandController {
  @Command('getdata', { auth: true })
  async getdata(m: GetDataMessage): Promise<void> {
    let thing: any;
    switch (m.type) {
      case 'board':
        thing = await this.context.dataService.getBoard(m.id);
        break;
      case 'tileset':
        thing = await this.context.dataService.getTileset(m.id);
        break;
      case 'asset':
        thing = await this.context.dataService.getAsset(m.id, m.bin);
        break;
      default:
        throw new Error(`Unrecognized data type: ${m.type}`);
    }

    if (!thing) {
      throw new Error("No data found");
    }

    this.context.socket.emit('getdata', thing);
  }
}
