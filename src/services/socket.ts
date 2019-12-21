import io from "socket.io";

const globalSubject = 'ws-rpg';
const consoleSubject = 'console';
const errorSubject = 'errors';

export class SocketServiceIO implements SocketService {
  constructor(private socket: io.Socket) { }

  emit(subject: string, payload: any): boolean {
    return this.wrap(subject, payload);
  }
  emitConsole(message: string): boolean {
    return this.wrap(consoleSubject, { message });
  }
  emitError(message: string): boolean {
    return this.wrap(errorSubject, { message });
  }
  private wrap(subject: string, payload: any): boolean {
    console.log('<=  Emitting message for subject: ' + subject);
    return this.socket.emit(globalSubject, { subject, payload });
  }
}

export interface SocketService {
  emit(subject: string, payload: any): void
  emitConsole(message: string): void
  emitError(message: string): void
}