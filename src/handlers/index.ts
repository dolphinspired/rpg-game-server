import * as s from '../services';
import * as m from '../models';

import getdata from './getdata';
import { auth } from './auth';
import { opensession, closesession, joinsession, leavesession } from './session';
import { ping } from './ping';

interface handlerWithSubject {
  subject: string;
  handler: (m: any, c: MessageHandlerContext) => Promise<void>;
  auth: boolean;
}

// Quicky lazy function for creating a handlerWithSubject
function h(subject: string, handler: (m: any, c: MessageHandlerContext) => Promise<void>, auth: boolean): handlerWithSubject {
  return { subject, handler, auth };
}

export interface MessageHandlerContext {
  currentSession: m.Session;
  player: s.User;

  authService: s.AuthService;
  dataService: s.DataService;
  sessionService: s.SessionService;
  socket: s.SocketService;
  userService: s.UserService;
}

// Maps message handlers to subjects that a socket will listen for
export function getAllRoutes(): handlerWithSubject[] {
  return [
    h('pringles', ping, false),
    h('auth', auth, false),

    h('getdata', getdata, true),
    h('open-session', opensession, true),
    h('close-session', closesession, true),
    h('join-session', joinsession, true),
    h('leave-session', leavesession, true),
  ]
}
