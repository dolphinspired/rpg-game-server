import { Command, CommandController, MessageHandlerContext } from "./command";

let count = 0;

export class PingController extends CommandController {
  @Command()
  async pringles(m: any): Promise<void> {
    return this.context.socket.emitConsole(`Received ping message: ${++count}`);
  }
}