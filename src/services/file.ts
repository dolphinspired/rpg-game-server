import fs from 'fs';
import path from 'path';
import util from 'util';

export class FileServiceFS implements FileService {
  private basePath: string;

  constructor() {
    this.basePath = path.resolve(`${__dirname}../../../bin/`);
    fs.exists(this.basePath, (exists: boolean) => {
      if (!exists) {
        console.log('WARNING: Asset path does not exist - ' + this.basePath);
      }
    });
  }

  async getAssetBase64(filename: string): Promise<string> {
    const buffer = await util.promisify(fs.readFile)(path.resolve(this.basePath, filename));
    return buffer.toString('base64');
  }
}

export interface FileService {
  getAssetBase64(filename: string): Promise<string>
}