import { Server, createServer } from "http";
import * as express from "express";
import * as socketIo from "socket.io"
import * as cors from "cors";

import { ChatEvent, ChatMessage } from "./types"

export class ChatServer {
  public static readonly PORT: number = 8080;

  private _app: express.Application;
  private server: Server;
  private io: SocketIO.Server;

  private port: string | number;

  constructor () {
    this._app = express();
    this.port = process.env.PORT || ChatServer.PORT;
    this._app.use(cors());
    this._app.options('*', cors());
    this.server = createServer(this._app);
    this.initSocket();
    this.listen();
  }

  get app(): express.Application {
    return this._app;
  }

  private initSocket (): void {
    this.io = socketIo(this.server);
  }

  private listen (): void {
    // server listening on our defined port
    this.server.listen(this.port, () => {
      console.log('Running server on port %s', this.port);
    });

    //socket events

    this.io.on(ChatEvent.CONNECT, (socket: any) => {
      console.log('Connected client on port %s.', this.port);

      socket.on(ChatEvent.MESSAGE, (m: ChatMessage) => {
        console.log('[server](message): %s', JSON.stringify(m));
        this.io.emit('message', m);
      });

      socket.on(ChatEvent.DISCONNECT, () => {
        console.log('Client disconnected');
      });
    });
  }
}