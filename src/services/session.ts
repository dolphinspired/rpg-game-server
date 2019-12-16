import * as m from '../models';

const sessions: m.Session[] = [];

export class SessionServiceMEM implements SessionService {
  getSessions(): m.Session[] {
    return sessions;
  }
  getSession(id: string): m.Session {
    return sessions.filter(s => s.id === id)[0];
  }
  openSession(id: string, board: m.Board): m.Session {
    if (this.getSession(id)) {
      throw new Error(`Session already exists with id '${id}'`)
    };
    const session = new m.Session();
    session.id = id;
    session.board = board;
    sessions.push(session);
    console.log(`Session opened: ${id}`);
    return session;
  }
  closeSession(id: string): m.Session {
    if (!this.getSession(id)) {
      return;
    };
    for(let i = 0; i < sessions.length; i++) {
      if (sessions[i].id === id) {
        const session = sessions[i];
        sessions.splice(i, 1);
        console.log(`Session closed: ${id}`);
        return session;
      }
    }
  }
}

export interface SessionService {
  getSessions(): m.Session[];
  getSession(id: string): m.Session;
  openSession(id: string, board: m.Board): m.Session;
  closeSession(id: string): m.Session;
}