import { SocketController } from './controller';

export type SocketRouteFunction = (m: any) => Promise<void>;

export type SocketRouteOptions = {
  auth?: boolean;
}

export function Route(subject?: string, options?: SocketRouteOptions) {
  return (target: SocketController, propertyKey: string, descriptor: TypedPropertyDescriptor<SocketRouteFunction>) => {
    target.addRoute(propertyKey, subject, options);
  }
}
