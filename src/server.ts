import https from "https";
import express from "express";
import io from "socket.io";
import cors from "cors";
import fs from "fs";
import tsyringe from 'tsyringe';
import 'reflect-metadata';

import * as di from './di';
import { AuthMiddleware, LoggingMiddleware } from "./middleware";

let container: tsyringe.DependencyContainer;

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
    container = di.registerAppServices();
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

      const cont = di.registerScopedServices(container, socket);

      // Register middleware
      const logger = cont.resolve(LoggingMiddleware);
      socket.use((p, e) => logger.log(p, e));

      const authorizer = cont.resolve(AuthMiddleware);
      socket.use((p, e) => authorizer.authorize(p, e));

      // Register controller handlers
      di.getResolvedControllers(cont).forEach(c => c.initRoutes(socket));

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
}

let app = new ChatServer().app;
export { app };