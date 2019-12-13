export class Tileset {
  _id: string;
  name: string;
  local: {[key: string]: string};
  img: string;
  tiles: Tile[];
}

export class Tile {
  n: string;
  x: number;
  y: number;
  w: number;
  h: number;
  a?: number;
  c?: number;
}