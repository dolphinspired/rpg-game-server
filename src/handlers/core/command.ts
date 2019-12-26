import { CommandController } from './controller';

export type CommandHandlerOptions = {
  auth?: boolean;
}

export function Command(subject?: string, options?: CommandHandlerOptions) {
  return (target: CommandController, propertyKey: string, descriptor: PropertyDescriptor) => {
    target.addRoute(propertyKey, subject, options);
  }
}
