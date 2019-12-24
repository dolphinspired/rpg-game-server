import fs from "fs";
import path from "path";
import util from "util";

import { MongoClient, Db, MongoClientOptions } from 'mongodb';

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

export class DataServiceMongo implements DataService {
  private db: Db;

  async init() {
    const connString = process.env.CONN_STRING;
    const dbName = process.env.DB_NAME;
    if (!connString) {
      throw new Error('Cannot start application - CONN_STRING is missing');
    }
    if (!dbName) {
      throw new Error('Cannot start application - DB_NAME is missing');
    }
    const options: MongoClientOptions = {
      useUnifiedTopology: true
    }
    const client = await MongoClient.connect(connString, options);
    console.log("Database connection successful");
    this.db = client.db(dbName);
  }
  async getBoard(id: string): Promise<m.Board> {
    const boards = await this.db.collection('board').find<m.Board>().toArray();
    return boards[0];
  }
  getTileset(id: string): Promise<m.Tileset> {
    return this.db.collection('tileset').findOne<m.Tileset>((x: m.Tileset) => x._id === id);
  }
  getAsset(id: string, bin: boolean): Promise<m.Asset> {
    return this.db.collection('asset').findOne<m.Asset>((x: m.Asset) => x._id === id);
  }
}

export interface DataService {
  getBoard(id: string): Promise<m.Board>;
  getTileset(id: string): Promise<m.Tileset>;
  getAsset(id: string, bin: boolean): Promise<m.Asset>;
}