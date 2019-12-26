import * as m from '../models';
import { Route, SocketController, SocketRouteContext } from "./core";
import { injectable, inject } from 'tsyringe';
import { SocketService, SessionService, DataService } from '../services';

interface SessionMessage {
  sessionId: string;
  boardId: string;
}

@injectable()
export class SessionController extends SocketController {
  constructor(
    @inject('context') private context: SocketRouteContext,
    @inject('data') private db: DataService,
    @inject('session') private session: SessionService,
    @inject('socket') private socket: SocketService,
  ) { super(); }

  @Route('open-session', { auth: true })
  async open(m: SessionMessage): Promise<void> {
    if (!m.sessionId || !m.boardId) {
      throw new Error('sessionId and boardId are required to open a session');
    }

    const existing = this.session.getSession(m.sessionId);
    if (existing) {
      throw new Error(`Cannot open session - a session already exists with id '${m.sessionId}'`);
    }

    const board = await this.db.getBoard(m.boardId);
    if (!board) {
      throw new Error(`Cannot open session - board '${m.boardId}' does not exist`);
    }

    const session = this.session.openSession(m.sessionId, this.context.player.name, board);
    this.context.currentSession = session;
    this.socket.emitConsole(`Session '${session.id}' opened`);
  }

  @Route('close-session', { auth: true })
  async close(m: SessionMessage): Promise<void> {
    let session: m.Session;
    if (m.sessionId) {
      // If a sessionId is specified, close that session
      session = this.session.getSession(m.sessionId);
    } else if (this.context.currentSession) {
      // Otherwise, close the socket's current session
      session = this.context.currentSession;
    } else {
      throw new Error('Cannot close session - no sessionId specified, and player is not currently in a session');
    }

    if (session.host !== this.context.player.name) {
      throw new Error('Cannot close session - you are not the host');
    }

    const sessionId = this.context.currentSession.id;
    this.context.currentSession = null;
    this.session.closeSession(sessionId);
    this.socket.emitConsole(`Session '${session.id}' closed`);
  }

  @Route('join-session', { auth: true })
  async join(m: SessionMessage): Promise<void> {
    if (!m.sessionId) {
      throw new Error('sessionId is required to join a session');
    }

    if (this.context.currentSession) {
      throw new Error(`Cannot join session - you are already in session '${this.context.currentSession.id}'`);
    }

    const session = this.session.getSession(m.sessionId);
    if (!session) {
      throw new Error(`Cannot join session - no session exists with id '${m.sessionId}'`);
    }

    if (session.players.indexOf(this.context.player.name) > -1) {
      throw new Error(`You are already in session '${m.sessionId}'`);
    }

    session.players.push(this.context.player.name);
    this.context.currentSession = session;
    this.socket.emitConsole(`Session '${session.id}' joined`);
  }

  @Route('leave-session', { auth: true })
  async leave(m: SessionMessage): Promise<void> {
    if (!this.context.currentSession) {
      throw new Error('Cannot leave session - player is not currently in a session');
    }

    const sessionId = this.context.currentSession.id;
    this.context.currentSession = null;
    this.socket.emitConsole(`Session '${sessionId}' left`);
  }
}
