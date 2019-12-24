import * as m from '../models';
import { Command, CommandController, MessageHandlerContext } from "./command";

interface SessionMessage {
  sessionId: string;
  boardId: string;
}

export class SessionController extends CommandController {
  @Command('open-session', { auth: true })
  async open(m: SessionMessage): Promise<void> {
    if (!m.sessionId || !m.boardId) {
      throw new Error('sessionId and boardId are required to open a session');
    }

    const existing = this.context.sessionService.getSession(m.sessionId);
    if (existing) {
      throw new Error(`Cannot open session - a session already exists with id '${m.sessionId}'`);
    }

    const board = await this.context.dataService.getBoard(m.boardId);
    if (!board) {
      throw new Error(`Cannot open session - board '${m.boardId}' does not exist`);
    }

    const session = this.context.sessionService.openSession(m.sessionId, this.context.player.name, board);
    this.context.currentSession = session;
    this.context.socket.emitConsole(`Session '${session.id}' opened`);
  }

  @Command('close-session', { auth: true })
  async close(m: SessionMessage): Promise<void> {
    let session: m.Session;
    if (m.sessionId) {
      // If a sessionId is specified, close that session
      session = this.context.sessionService.getSession(m.sessionId);
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
    this.context.sessionService.closeSession(sessionId);
    this.context.socket.emitConsole(`Session '${session.id}' closed`);
  }

  @Command('join-session', { auth: true })
  async join(m: SessionMessage): Promise<void> {
    if (!m.sessionId) {
      throw new Error('sessionId is required to join a session');
    }

    if (this.context.currentSession) {
      throw new Error(`Cannot join session - you are already in session '${this.context.currentSession.id}'`);
    }

    const session = this.context.sessionService.getSession(m.sessionId);
    if (!session) {
      throw new Error(`Cannot join session - no session exists with id '${m.sessionId}'`);
    }

    if (session.players.indexOf(this.context.player.name) > -1) {
      throw new Error(`You are already in session '${m.sessionId}'`);
    }

    session.players.push(this.context.player.name);
    this.context.currentSession = session;
    this.context.socket.emitConsole(`Session '${session.id}' joined`);
  }

  @Command('leave-session', { auth: true })
  async leave(m: SessionMessage): Promise<void> {
    if (!this.context.currentSession) {
      throw new Error('Cannot leave session - player is not currently in a session');
    }

    const sessionId = this.context.currentSession.id;
    this.context.currentSession = null;
    this.context.socket.emitConsole(`Session '${sessionId}' left`);
  }
}
