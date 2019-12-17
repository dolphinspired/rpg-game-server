import * as s from '../services';
import { GameSocket } from '../game-socket';

import getdata from './getdata';

interface handlerWithSubject {
  subject: string;
  handler: (m: any, c: MessageHandlerContext) => Promise<void>;
}

// Quicky lazy function for creating a handlerWithSubject
function h(subject: string, handler: (m: any, c: MessageHandlerContext) => Promise<void>): handlerWithSubject {
  return { subject, handler }
}

export interface MessageHandlerContext {
  dataService: s.DataService;
  sessionService: s.SessionService;
  gameSocket: GameSocket;
}

// Maps message handlers to subjects that a socket will listen for
export function getAllRoutes(): handlerWithSubject[] {
  return [
    h('getdata', getdata)
  ]
}
