import * as s from '../services';
import * as m from '../models';

import { signup, login, logout } from './account';
import getdata from './getdata';
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
  token: string;

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
    h('signup', signup, false),
    h('login', login, false),

    h('logout', logout, true),
    h('getdata', getdata, true),
    h('open-session', opensession, true),
    h('close-session', closesession, true),
    h('join-session', joinsession, true),
    h('leave-session', leavesession, true),
  ]
}
