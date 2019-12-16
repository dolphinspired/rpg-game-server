import * as io from "socket.io"

import * as m from './models';

export class GameSocket {
  public session: m.Session;
  public playerId: string;

  constructor(public socket: io.Socket) {}
}