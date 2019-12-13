import * as fs from "fs";
import * as path from "path";
import * as util from "util";

import * as m from "../models";

async function getJSONFile(pat: string, name: string): Promise<any> {
  const p = path.resolve(`${__dirname}../../../data/${pat}/${name}.json`);
  if (await util.promisify(fs.exists)(p) === false) {
    console.log("file '" + name + "' not found. Path: " + p)
    return null;
  }

  const buffer = await util.promisify(fs.readFile)(p);
  return JSON.parse(buffer.toString());
}

async function getAssetFileBase64(name: string): Promise<string> {
  const p = path.resolve(`${__dirname}../../../data/asset/${name}`);
  if (await util.promisify(fs.exists)(p) === false) {
    console.log("file '" + name + "' not found. Path: " + p)
    return null;
  }

  const buffer = await util.promisify(fs.readFile)(p);
  return buffer.toString('base64');
}

export class DataServiceFS implements DataService {
  async getBoard(id: string): Promise<m.Board> {
    const obj = await getJSONFile('board', id);
    return obj as m.Board;
  }

  async getTileset(id: string): Promise<m.Tileset> {
    const obj = await getJSONFile('tileset', id);
    return obj as m.Tileset;
  }

  async getAsset(id: string, bin: boolean): Promise<m.Asset> {
    const obj = await getJSONFile('asset', id);
    const asset = obj as m.Asset;
    if (bin && asset.src) {
      asset.bin = await getAssetFileBase64(asset.src);
    }
    return asset;
  }
}

export interface DataService {
  getBoard(id: string): Promise<m.Board>;
  getTileset(id: string): Promise<m.Tileset>;
  getAsset(id: string, bin: boolean): Promise<m.Asset>;
}