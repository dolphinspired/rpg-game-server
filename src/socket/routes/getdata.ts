import { MessageRoute } from '../msg-route';

class GetDataMessage {
  id: string;
  type: string;
  bin: boolean;
}

export class GetDataRoute extends MessageRoute {
  subject = "getdata";

  async handle(m: GetDataMessage): Promise<void> {
    console.log('[server](getdata): %s', JSON.stringify(m));
    let thing: any;
    switch (m.type) {
      case 'board':
        thing = await this.dataService.getBoard(m.id);
        break;
      case 'tileset':
        thing = await this.dataService.getTileset(m.id);
        break;
      case 'asset':
        thing = await this.dataService.getAsset(m.id, m.bin);
        break;
      default:
        console.log(`Unrecognized data type: ${m.type}`)
        return;
    }

    if (!thing) {
      console.log("No data found")
      return;
    }

    console.log("Data found!")
    this.gameSocket.socket.server.emit('getdata', thing)
  }
}