import { Command, CommandController, MessageHandlerContext } from "./command";

let count = 0;

export class PingController extends CommandController {
  @Command()
  async pringles(m: any, c: MessageHandlerContext): Promise<void> {
    return c.socket.emitConsole(`Received ping message: ${++count}`);
  }
}