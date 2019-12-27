import { MongoClient, Db, MongoClientOptions } from 'mongodb';

import { FileService } from '.';
import * as m from "../models";
import { injectable, inject } from '../di';

@injectable()
export class DataServiceMongo implements DataService {
  private db: Db;

  constructor(@inject('file') private fileService: FileService) {}

  private async init() {
    if (this.db) return;

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
  async getBoard(_id: string): Promise<m.Board> {
    await this.init();
    return await this.db.collection('board').findOne<m.Board>({ _id });
  }
  async getTileset(_id: string): Promise<m.Tileset> {
    await this.init();
    return await this.db.collection('tileset').findOne<m.Tileset>({ _id });
  }
  async getAsset(_id: string, bin: boolean): Promise<m.Asset> {
    await this.init();
    const asset = await this.db.collection('asset').findOne<m.Asset>({ _id });
    if (bin && asset.src) {
      asset.bin = await this.fileService.getAssetBase64(asset.src);
    }
    return asset;
  }
}

export interface DataService {
  getBoard(id: string): Promise<m.Board>;
  getTileset(id: string): Promise<m.Tileset>;
  getAsset(id: string, bin: boolean): Promise<m.Asset>;
}