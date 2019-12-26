import { Board } from './board';

export type Session = {
  id: string;
  host: string;
  players: string[];
  board: Board;
}