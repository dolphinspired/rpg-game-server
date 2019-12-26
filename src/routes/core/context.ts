import * as m from '../../models';

export type SocketRouteContext = {
  currentSession: m.Session;
  player: m.User;
  token: string;
}