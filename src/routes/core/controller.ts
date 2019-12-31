import io from 'socket.io';

import { AuthMiddleware } from "../../middleware";
import { SocketRouteOptions } from './route';
import { injectable } from '../../di';

export type SocketRoute = {
  method: string;
  subject: string;
  options?: SocketRouteOptions;
}

@injectable()
export abstract class SocketController {
  private routes: SocketRoute[];

  public addRoute(method: string, subject: string, options: SocketRouteOptions) {
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
        console.log('[Warning] Route has no subject, it will not be registered');
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