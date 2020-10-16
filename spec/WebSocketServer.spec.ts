import useWebSocketServer from "../src/index";
import Http from "http";
import WebSocket from "websocket";

describe("WebSocketServer", () => {
  let _httpServer: Http.Server;
  let _webSocketServer: ReturnType<typeof useWebSocketServer>;

  beforeEach(() => {
    _httpServer = Http.createServer();
    _webSocketServer = useWebSocketServer(_httpServer);
    _webSocketServer.setOption({ logEnabled: false });
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
        _webSocketServer.addOnRequest((_id) => {
          id = _id;
          if (connection) {
            resolve(connection);
          }
        });
      });
    }

    function messageAsync(connection: WebSocket.connection) {
      return new Promise((resolve) => {
        _webSocketServer.addOnMessage((id, message) => {
          connection.on("message", (data) => {
            resolve(data.utf8Data);
          });
          _webSocketServer.send(message);
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

  describe("addOnRequest", () => {
    it("", () => {
      const ls = _webSocketServer._.state.eventHandlers.request;
      const handler = (id: number) => {};
      expect(ls).not.toContain(handler);
      _webSocketServer.addOnRequest(handler);
      expect(ls).toContain(handler);
    });
  });

  describe("addOnMessage", () => {
    it("", () => {
      const ls = _webSocketServer._.state.eventHandlers.message;
      const handler = (id: number, message: string) => {};
      expect(ls).not.toContain(handler);
      _webSocketServer.addOnMessage(handler);
      expect(ls).toContain(handler);
    });
  });

  describe("addOnClose", () => {
    it("", () => {
      const ls = _webSocketServer._.state.eventHandlers.close;
      const handler = (id: number) => {};
      expect(ls).not.toContain(handler);
      _webSocketServer.addOnClose(handler);
      expect(ls).toContain(handler);
    });
  });

  describe("removeOn", () => {
    let messageEventHandlers: any[];

    beforeEach(() => {
      messageEventHandlers = [];
      for (let i = 0, len = 10; i < len; i++) {
        const handler = (id: number, message: string) => {};
        _webSocketServer.addOnMessage(handler);
        messageEventHandlers.push(handler);
      }
    });

    it("", () => {
      const ls = _webSocketServer._.state.eventHandlers.message;
      expect(ls).toEqual(messageEventHandlers);

      const dummyHandler = (id: number, message: string) => {};
      _webSocketServer.removeOn("message", dummyHandler);
      expect(ls).toEqual(messageEventHandlers);

      messageEventHandlers
        .reverse()
        .forEach((h) => _webSocketServer.removeOn("message", h));
      expect(ls).not.toEqual(messageEventHandlers);
      expect(ls).toEqual([]);
    });
  });
});
