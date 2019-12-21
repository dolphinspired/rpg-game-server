import * as s from '../services';
import * as m from '../models';

export interface CommandPropertyDescriptor extends TypedPropertyDescriptor<CommandHandlerFunction> {
  subject?: string;
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

export type CommandHandlerFunction = (m: any, c: MessageHandlerContext) => Promise<void>;

export function Command(subject?: string, options?: CommandHandlerOptions) {
  return (target: CommandController, propertyKey: string, descriptor: CommandPropertyDescriptor) => {
    descriptor.subject = subject || propertyKey;
    descriptor.options = options || {};
    if (!target._routes) {
      target._routes = [];
    }

    target._routes.push(descriptor);
  }
}

export abstract class CommandController {
  public _routes: CommandPropertyDescriptor[];
}
