import { MessageHandlerContext } from ".";

let count = 0;

export async function ping(m: any, c: MessageHandlerContext): Promise<void> {
  return c.socket.emit('pringles', { message: `Received ping message: ${++count}` });
}