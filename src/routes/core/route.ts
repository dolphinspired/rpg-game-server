import { SocketController } from './controller';

export type SocketRouteOptions = {
  auth?: boolean;
}

export function Route(subject?: string, options?: SocketRouteOptions) {
  return (target: SocketController, propertyKey: string, descriptor: PropertyDescriptor) => {
    target.addRoute(propertyKey, subject, options);
  }
}
