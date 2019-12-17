import { MessageHandlerContext } from ".";

class GetDataMessage {
  id: string;
  type: string;
  bin: boolean;
}

export default async function getdata(m: GetDataMessage, c: MessageHandlerContext): Promise<void> {
  console.log('[server](getdata): %s', JSON.stringify(m));
  let thing: any;
  switch (m.type) {
    case 'board':
      thing = await c.dataService.getBoard(m.id);
      break;
    case 'tileset':
      thing = await c.dataService.getTileset(m.id);
      break;
    case 'asset':
      thing = await c.dataService.getAsset(m.id, m.bin);
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
  c.gameSocket.socket.server.emit('getdata', thing)
}