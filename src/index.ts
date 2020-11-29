import Http from "http";
import WebSocket from "websocket";

export interface IOnRequest {
  id: number;
}
export interface IOnMessage {
  id: number;
  message: string;
}
export interface IOnClose {
  id: number;
}

export type OnRequestType = (param: IOnRequest) => void;
export type OnMessageType = (param: IOnMessage) => void;
export type OnCloseType = (param: IOnClose) => void;

export function defaultState() {
  return {
    id: 1,
    connections: {} as { [key: number]: WebSocket.connection },
    eventHandlers: {
      request: [] as OnRequestType[],
      message: [] as OnMessageType[],
      close: [] as OnCloseType[],
    },
    httpServer: null as Http.Server | null,
  };
}
type DefaultStateType = ReturnType<typeof defaultState>;

type DefaultType = ReturnType<typeof _default>;

export default function _default(
  httpServerOrPort: Http.Server | number = 3000,
  state?: DefaultStateType
) {
  let httpServer: Http.Server;
  if (typeof httpServerOrPort == "number") {
    httpServer = Http.createServer();
    httpServer.listen(httpServerOrPort);
  } else {
    httpServer = httpServerOrPort;
  }

  const _state = state || defaultState();
  _state.httpServer = httpServer;

  const self = {
    send,
    close,
    addOnRequest,
    addOnMessage,
    addOnClose,
    removeOnRequest,
    removeOnMessage,
    removeOnClose,
  };

  const wss = new WebSocket.server({ httpServer });
  wss.on("request", (request) => _onRequest(_state.id++, request));

  function _onRequest(id: number, request: WebSocket.request) {
    const connection = request.accept(undefined, request.origin);
    _state.connections[id] = connection;

    connection.on("message", (message) => _onMessage(id, message));
    connection.on("close", (_) => _onClose(id, _));

    const param = { id };
    _state.eventHandlers.request.forEach((h) => h(param));
  }

  function _onMessage(id: number, message: WebSocket.IMessage) {
    const param = { id, message: message.utf8Data || "" };
    _state.eventHandlers.message.forEach((h) => h(param));
  }

  function _onClose(id: number, _: number) {
    if (!_state.connections[id]) {
      return;
    }
    delete _state.connections[id];

    const param = { id };
    _state.eventHandlers.close.forEach((h) => h(param));
  }

  function send(dataString: string): DefaultType {
    for (const id in _state.connections) {
      const c = _state.connections[id];
      if (c) {
        c.send(dataString);
      }
    }
    return self;
  }

  function close(): DefaultType {
    wss.closeAllConnections();
    return self;
  }

  function addOnRequest(handler: OnRequestType): DefaultType {
    _state.eventHandlers.request.push(handler);
    return self;
  }

  function addOnMessage(handler: OnMessageType): DefaultType {
    _state.eventHandlers.message.push(handler);
    return self;
  }

  function addOnClose(handler: OnCloseType): DefaultType {
    _state.eventHandlers.close.push(handler);
    return self;
  }

  function removeOnRequest(handler: OnRequestType): DefaultType {
    _removeOn(_state.eventHandlers.request, handler);
    return self;
  }

  function removeOnMessage(handler: OnMessageType): DefaultType {
    _removeOn(_state.eventHandlers.message, handler);
    return self;
  }

  function removeOnClose(handler: OnCloseType): DefaultType {
    _removeOn(_state.eventHandlers.close, handler);
    return self;
  }

  function _removeOn(ls: any[], handler: any) {
    if (ls) {
      const index = ls.findIndex((x) => x == handler);
      if (index != -1) {
        ls.splice(index, 1);
      }
    }
  }

  return self;
}
