import useWebSocketServer, {
  defaultState,
  IOnRequest,
  IOnMessage,
  IOnClose,
  OnMessageType,
} from "../src";
import Http from "http";
import WebSocket from "websocket";

describe("WebSocketServer", () => {
  let _httpServer: Http.Server;
  let _state: ReturnType<typeof defaultState>;
  let _webSocketServer: ReturnType<typeof useWebSocketServer>;

  beforeEach(() => {
    _httpServer = Http.createServer();
    _state = defaultState();
    _webSocketServer = useWebSocketServer(_httpServer, _state);
  });

  describe("request-message-close", () => {
    it("", async () => {
      const port = 8099;
      _httpServer.listen(port);
      const client = new WebSocket.client();

      client.connect(`ws://localhost:${port}`);
      const connection = await requestAsync(client);

      const originalMessage = "hello-world";
      connection.send(originalMessage);
      const receivedMessage = await messageAsync(connection);
      expect(originalMessage).toEqual(receivedMessage);

      _webSocketServer.close();
      _httpServer.close();
      await closeAsync();
    });

    function requestAsync(
      client: WebSocket.client
    ): Promise<WebSocket.connection> {
      return new Promise((resolve) => {
        let connection: WebSocket.connection;
        let id: number;
        client.on("connect", (c) => {
          connection = c;
          if (id) {
            resolve(connection);
          }
        });
        _webSocketServer.addOnRequest((param) => {
          id = param.id;
          if (connection) {
            resolve(connection);
          }
        });
      });
    }

    function messageAsync(connection: WebSocket.connection) {
      return new Promise((resolve) => {
        _webSocketServer.addOnMessage((param) => {
          connection.on("message", (data) => {
            resolve(data.utf8Data);
          });
          _webSocketServer.send(param.message);
        });
      });
    }

    function closeAsync() {
      return new Promise((resolve) => {
        _webSocketServer.addOnClose((id) => {
          resolve();
        });
      });
    }
  });

  describe("empty http server", () => {
    it("", () => {
      const state = defaultState();
      expect(state.httpServer).toBeNull();
      useWebSocketServer(undefined, state);
      expect(state.httpServer).not.toBeNull();
      state.httpServer?.close();
    });
  });

  describe("addOnRequest", () => {
    it("", () => {
      const ls = _state.eventHandlers.request;
      const handler = (param: IOnRequest) => {};
      expect(ls).not.toContain(handler);
      _webSocketServer.addOnRequest(handler);
      expect(ls).toContain(handler);
    });
  });

  describe("addOnMessage", () => {
    it("", () => {
      const ls = _state.eventHandlers.message;
      const handler = (param: IOnMessage) => {};
      expect(ls).not.toContain(handler);
      _webSocketServer.addOnMessage(handler);
      expect(ls).toContain(handler);
    });
  });

  describe("addOnClose", () => {
    it("", () => {
      const ls = _state.eventHandlers.close;
      const handler = (param: IOnClose) => {};
      expect(ls).not.toContain(handler);
      _webSocketServer.addOnClose(handler);
      expect(ls).toContain(handler);
    });
  });

  describe("removeOn", () => {
    let messageEventHandlers: OnMessageType[];

    beforeEach(() => {
      messageEventHandlers = [];
      for (let i = 0, len = 10; i < len; i++) {
        const handler = (param: IOnMessage) => {};
        _webSocketServer.addOnMessage(handler);
        messageEventHandlers.push(handler);
      }
    });

    it("", () => {
      const ls = _state.eventHandlers.message;
      expect(ls).toEqual(messageEventHandlers);

      const dummyHandler = (param: IOnMessage) => {};
      _webSocketServer.removeOnMessage(dummyHandler);
      expect(ls).toEqual(messageEventHandlers);

      messageEventHandlers
        .reverse()
        .forEach((h) => _webSocketServer.removeOnMessage(h));
      expect(ls).not.toEqual(messageEventHandlers);
      expect(ls).toEqual([]);
    });
  });
});
