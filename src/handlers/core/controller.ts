import io from 'socket.io';

import { AuthMiddleware } from "../../middleware";
import { CommandHandlerOptions } from './command';

export type CommandHandlerInitializer = {
  method: string;
  subject: string;
  options?: CommandHandlerOptions;
}

export abstract class CommandController {
  private routes: CommandHandlerInitializer[];

  public addRoute(method: string, subject: string, options: CommandHandlerOptions) {
    if (!this.routes) {
      this.routes = [];
    }

    this.routes.push({
      method: method,
      subject: subject || method,
      options: options || {}
    });
  }

  public initRoutes(socket: io.Socket) {
    this.routes.forEach(route => {
      if (!route.subject) {
        console.log('[Warning] Handler has no subject, it will not be registered');
        return;
      }

      if (route.options) {
        if (route.options.auth) {
          AuthMiddleware.watch(route.subject);
        }
      }

      socket.on(route.subject, async (msg) => {
        await (this as any)[route.method](msg);
      });
    });
  }
}