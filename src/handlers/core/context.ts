import * as m from '../../models';

export type MessageHandlerContext = {
  currentSession: m.Session;
  player: m.User;
  token: string;
}