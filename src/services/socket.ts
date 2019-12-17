import * as io from "socket.io";

const errorSubject = 'errors';

export class SocketServiceIO implements SocketService {
  constructor(private socket: io.Socket) { }

  emit(subject: string, payload: any): boolean {
    return this.socket.emit(subject, payload);
  }
  emitError(message: string): boolean {
    return this.socket.emit(errorSubject, { message })
  }
}

export interface SocketService {
  emit(subject: string, payload: any): void
  emitError(message: string): void
}