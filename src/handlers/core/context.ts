import * as m from '../../models';
import * as s from '../../services';

export type MessageHandlerContext = {
  currentSession: m.Session;
  player: s.User;
  token: string;
}