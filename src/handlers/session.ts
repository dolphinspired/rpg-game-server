import { MessageHandlerContext } from ".";
import * as m from '../models';

interface SessionMessage {
  sessionId: string;
  boardId: string;
  userId: string;
}

export async function opensession(m: SessionMessage, c: MessageHandlerContext): Promise<void> {
  if (!m.sessionId || !m.boardId || !m.userId) {
    return c.socket.emitError('sessionId, boardId, and userId are required to open a session');
  }

  const board = await c.dataService.getBoard(m.boardId);
  if (!board) {
    return c.socket.emitError(`Cannot open session - board '${m.boardId}' does not exist`);
  }

  const session = c.sessionService.openSession(m.sessionId, m.userId, board);
  c.currentSession = session;
  c.socket.emit('session', { message: `Session '${session.id}' opened` });
}

export async function closesession(m: SessionMessage, c: MessageHandlerContext): Promise<void> {
  let session: m.Session;
  if (m.sessionId) {
    // If a sessionId is specified, close that session
    session = c.sessionService.getSession(m.sessionId);
  } else if (c.currentSession) {
    // Otherwise, close the socket's current session
    session = c.currentSession;
  } else {
    return c.socket.emitError('Cannot close session - no sessionId specified, and player is not currently in a session');
  }

  c.sessionService.closeSession(session.id);
  c.socket.emit('session', { message: `Session '${session.id}' closed`});
}

export async function joinsession(m: SessionMessage, c: MessageHandlerContext): Promise<void> {
  if (!m.sessionId || !m.userId) {
    return c.socket.emitError('sessionId and userId are required to join a session');
  }

  if (c.currentSession) {
    return c.socket.emitError(`Cannot join session - you are already in session '${c.currentSession.id}'`);
  }

  const session = c.sessionService.getSession(m.sessionId);
  if (!session) {
    return c.socket.emitError(`Cannot join session - no session exists with id '${m.sessionId}'`);
  }

  if (session.players.indexOf(m.userId) > -1) {
    return c.socket.emitError(`You are already in session '${m.sessionId}'`);
  }

  session.players.push(m.userId);
  c.currentSession = session;
  c.socket.emit('session', { message: `Session '${session.id}' joined` });
}

export async function leavesession(m: SessionMessage, c: MessageHandlerContext): Promise<void> {
  if (!c.currentSession) {
    return c.socket.emitError('Cannot leave session - player is not currently in a session');
  }

  const sessionId = c.currentSession.id;
  c.currentSession = null;
  c.socket.emit('session', { message: `Session '${sessionId}' left`});
}