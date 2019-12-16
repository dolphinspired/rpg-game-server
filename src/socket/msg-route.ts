import * as s from '../services';

import { GameSocket } from '../game-socket';

export abstract class MessageRoute {
  public dataService: s.DataService;
  public sessionService: s.SessionService;
  public gameSocket: GameSocket;

  abstract subject: string;
  abstract handle(msg: any): Promise<void>;
}
