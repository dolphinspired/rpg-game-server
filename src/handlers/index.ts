import * as s from '../services';
import * as m from '../models';

import getdata from './getdata';
import { opensession, closesession, joinsession, leavesession } from './session';

interface handlerWithSubject {
  subject: string;
  handler: (m: any, c: MessageHandlerContext) => Promise<void>;
}

// Quicky lazy function for creating a handlerWithSubject
function h(subject: string, handler: (m: any, c: MessageHandlerContext) => Promise<void>): handlerWithSubject {
  return { subject, handler }
}

export interface MessageHandlerContext {
  currentSession: m.Session;
  playerId: string;

  dataService: s.DataService;
  sessionService: s.SessionService;
  socket: s.SocketService;
}

// Maps message handlers to subjects that a socket will listen for
export function getAllRoutes(): handlerWithSubject[] {
  return [
    h('getdata', getdata),
    h('open-session', opensession),
    h('close-session', closesession),
    h('join-session', joinsession),
    h('leave-session', leavesession),
  ]
}
