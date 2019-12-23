import io from 'socket.io';

import * as s from '../services';
import * as m from '../models';

type CommandHandlerInitializer = {
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

  authService: s.AuthService;
  dataService: s.DataService;
  sessionService: s.SessionService;
  socket: s.SocketService;
  userService: s.UserService;
}

export type CommandHandlerFunction = (m: any) => Promise<void>;

export function Command(subject?: string, options?: CommandHandlerOptions) {
  return (target: CommandController, propertyKey: string, descriptor: PropertyDescriptor) => {
    target.addRoute(propertyKey, subject, options);
  }
}

export abstract class CommandController {
  private routes: CommandHandlerInitializer[];
  public context: MessageHandlerContext;

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

  public initRoutes(socket: io.Socket, context: MessageHandlerContext) {
    this.context = context;

    this.routes.forEach(route => {
      if (!route.subject) {
        console.log('[Warning] Handler has no subject, it will not be registered');
        return;
      }

      socket.on(route.subject, async (msg) => {
        console.log(` => Received message for subject: ${route.subject}`);
        if (route.options.auth) {
          try {
            await context.authService.auth(context.token);
          } catch {
            console.log(`[Error] Unauthorized`);
            context.socket.emitError('Unauthorized');
            return;
          }
        }

        try {
          await (this as any)[route.method](msg);
        } catch (e) {
          console.log(`[Error] ${e.message || e}`);
          context.socket.emitError(e.message || e);
        }
      });
    });
  }
}
