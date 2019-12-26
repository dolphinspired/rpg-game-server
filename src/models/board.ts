export type Board = {
  _id: string;
  name: string;
  local: {[key: string]: string};
  lbids: string[];
  tileset: string;
  length: number;
  width: number;
  map: BoardMap;
}

export type BoardMap = {
  talias: {[key: string]: string};
  tiles: number[];
}