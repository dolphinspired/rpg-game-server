import io from 'socket.io';
import { injectable, inject } from 'tsyringe';

import * as s from '../services';
import * as m from '../models';
import { AuthMiddleware } from './middleware';

export type CommandHandlerInitializer = {
  method: string;
  subject: string;
  options?: CommandHandlerOptions;
}

export type CommandHandlerOptions = {
  auth?: boolean;
}

export type MessageHandlerContext = {
  currentSession: m.Session;
  player: s.User;
  token: string;
}

export type CommandHandlerFunction = (m: any) => Promise<void>;

export function Command(subject?: string, options?: CommandHandlerOptions) {
  return (target: CommandController, propertyKey: string, descriptor: PropertyDescriptor) => {
    target.addRoute(propertyKey, subject, options);
  }
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
