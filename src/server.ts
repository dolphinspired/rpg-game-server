import * as https from "https";
import * as express from "express";
import * as io from "socket.io"
import * as cors from "cors";
import * as fs from "fs";
import { DataServiceFS } from './services';

class ChatServer {
  public static readonly PORT: number = 8081;

  private _app: express.Application;
  private server: https.Server;
  private io: SocketIO.Server;

  private port: string | number;

  constructor () {
    this._app = express();
    this.port = process.env.PORT || ChatServer.PORT;
    // this._app.use(cors());
    // this._app.options('*', cors());
    this.server = https.createServer({
      key: fs.readFileSync('cert/localhost.key'),
      cert: fs.readFileSync('cert/localhost.crt')
    }, this._app);
    this.initSocket();
    this.listen();
  }

  get app(): express.Application {
    return this._app;
  }

  private initSocket (): void {
    this.io = io(this.server);
  }

  private listen (): void {
    // server listening on our defined port
    this.server.listen(this.port, () => {
      console.log('Running server on port %s', this.port);
    });

    //socket events

    this.io.on('connect', (socket: io.Socket) => {
      console.log('Connected client on port %s.', this.port);

      socket.on('message', (m: any) => {
        console.log('[server](message): %s', JSON.stringify(m));
        this.io.emit('message', m);
      });

      socket.on('getdata', async (m: any) => {
        console.log('[server](getdata): %s', JSON.stringify(m));
        const svc = new DataServiceFS();
        let thing: any;
        switch (m.type) {
          case 'board':
            thing = await svc.getBoard(m.id);
            break;
          case 'tileset':
            thing = await svc.getTileset(m.id);
            break;
          case 'asset':
            thing = await svc.getAsset(m.id, m.bin);
            break;
          default:
            console.log(`Unrecognized data type: ${m.type}`)
            return;
        }

        if (!thing) {
          console.log("No data found")
          return;
        }

        console.log("Data found!")
        this.io.emit('getdata', thing)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
}

let app = new ChatServer().app;
export { app };