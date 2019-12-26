import io from 'socket.io';
import { container, DependencyContainer } from 'tsyringe';

import * as c from './handlers';
import * as s from './services';
import { CommandController } from './handlers/core';

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

export function registerAppServices(): DependencyContainer {
  container.registerType(tokens.auth, s.AuthServiceMEM);
  container.registerType(tokens.data, s.DataServiceMongo);
  container.registerType(tokens.file, s.FileServiceFS);
  container.registerType(tokens.session, s.SessionServiceMEM);
  container.registerType(tokens.user, s.UserServiceMEM);
  return container;
}

export function registerScopedServices(cont: DependencyContainer, socket: io.Socket): DependencyContainer {
  const child = cont.createChildContainer();
  child.register(tokens.io, { useValue: socket });
  child.registerType(tokens.socket, s.SocketServiceIO);
  child.register(tokens.context, { useValue: {} });
  return child;
}

export function getResolvedControllers(cont: DependencyContainer): CommandController[] {
  return [
    cont.resolve(c.AccountController),
    cont.resolve(c.DataController),
    cont.resolve(c.PingController),
    cont.resolve(c.SessionController),
  ];
}
