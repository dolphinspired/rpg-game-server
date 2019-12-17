import { Board } from './board';

export class Session {
  id: string;
  host: string;
  players: string[];
  board: Board;
}