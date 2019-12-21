import https from "https";
import express from "express";
import io from "socket.io"
import cors from "cors";
import fs from "fs";

import * as s from './services';
import * as h from './handlers';

const controllers = [
  new h.AccountController(),
  new h.DataController(),
  new h.PingController(),
  new h.SessionController(),
]

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

      const userService = new s.UserServiceMEM();
      const context: h.MessageHandlerContext = {
        currentSession: null,
        player: null,
        token: null,

        authService: new s.AuthServiceMEM(userService),
        dataService: new s.DataServiceFS(),
        sessionService: new s.SessionServiceMEM(),
        socket: new s.SocketServiceIO(socket),
        userService,
      }

      let i = 0;
      controllers.forEach(controller => controller._routes.forEach(route => {
        if (!route.subject) {
          console.log('[Warning] Handler has no subject, it will not be registered');
          return;
        }

        socket.on(route.subject, async (msg) => {
          console.log(` => Received message for subject: ${route.subject}`);
          if (route.options.auth) {
            try {
              await context.authService.auth(context.token);
            } catch {
              console.log(`[Error] Unauthorized`);
              context.socket.emitError('Unauthorized');
              return;
            }
          }

          try {
            await route.value(msg, context);
          } catch (e) {
            console.log(`[Error] ${e.message || e}`);
            context.socket.emitError(e.message || e);
          }
        });
      }));

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
}

let app = new ChatServer().app;
export { app };