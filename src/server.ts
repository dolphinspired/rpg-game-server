import * as https from "https";
import * as express from "express";
import * as io from "socket.io"
import * as cors from "cors";
import * as fs from "fs";

import { getAllRoutes, MessageHandlerContext } from './handlers';
import { DataServiceFS, SessionServiceMEM, SocketServiceIO } from './services';

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

      const context: MessageHandlerContext = {
        currentSession: null,
        playerId: null,

        dataService: new DataServiceFS(),
        sessionService: new SessionServiceMEM(),
        socket: new SocketServiceIO(socket)
      }

      getAllRoutes().forEach(route => {
        socket.on(route.subject, msg => route.handler(msg, context));
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
}

let app = new ChatServer().app;
export { app };