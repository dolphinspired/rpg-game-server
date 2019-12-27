import { injectable, inject, Container } from 'inversify';

import * as c from './routes';
import * as s from './services';
import { SocketController } from './routes/core';

let appContainer: Container;

// This allows: import { injectable, inject, tokens } from this file
export { injectable, inject }

export const tokens = {
  auth: 'auth',
  context: 'context',
  data: 'data',
  file: 'file',
  io: 'io',
  session: 'session',
  socket: 'socket',
  user: 'user',
}

export function registerAppServices(): Container {
  if (appContainer) {
    // Only register app services once (static)
    return appContainer;
  }

  appContainer = new Container();
  appContainer.bind<s.AuthService>(tokens.auth).to(s.AuthServiceMEM);
  appContainer.bind<s.DataService>(tokens.data).to(s.DataServiceMongo);
  appContainer.bind<s.FileService>(tokens.file).to(s.FileServiceFS);
  appContainer.bind<s.SessionService>(tokens.session).to(s.SessionServiceMEM);
  appContainer.bind<s.UserService>(tokens.user).to(s.UserServiceMEM);
  return appContainer;
}

export function registerScopedServices(cont: Container, socket: SocketIO.Socket): Container {
  const child = cont.createChild();
  child.bind<SocketIO.Socket>(tokens.io).toConstantValue(socket);
  child.bind<s.SocketService>(tokens.socket).to(s.SocketServiceIO);
  child.bind(tokens.context).toConstantValue({});
  return child;
}

export function getResolvedControllers(cont: Container): SocketController[] {
  return [
    cont.resolve(c.AccountController),
    cont.resolve(c.DataController),
    cont.resolve(c.PingController),
    cont.resolve(c.SessionController),
  ];
}
