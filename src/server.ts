import https from "https";
import express from "express";
import io from "socket.io"
import cors from "cors";
import fs from "fs";

import * as s from './services';
import * as h from './handlers';
import { DataServiceMongo } from "./services";

const controllers = [
  new h.AccountController(),
  new h.DataController(),
  new h.PingController(),
  new h.SessionController(),
]

let dataService: DataServiceMongo;

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
    dataService = new DataServiceMongo();
    dataService.init(); // this promise is not awaited
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

      const userService = new s.UserServiceMEM();
      const context: h.MessageHandlerContext = {
        currentSession: null,
        player: null,
        token: null,

        authService: new s.AuthServiceMEM(userService),
        dataService: dataService,
        sessionService: new s.SessionServiceMEM(),
        socket: new s.SocketServiceIO(socket),
        userService,
      }

      controllers.forEach(c => c.initRoutes(socket, context));

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
}

let app = new ChatServer().app;
export { app };