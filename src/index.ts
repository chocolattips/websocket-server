import Http from "http";
import WebSocket from "websocket";

export type OnRequestType = (id: number) => void;
export type OnMessageType = (id: number, message: string) => void;
export type OnCloseType = (id: number) => void;

type DefaultType = ReturnType<typeof _default>;

export default function _default(httpServer: Http.Server) {
  let __id = 1;
  const state = {
    connections: {} as { [key: number]: WebSocket.connection },
    eventHandlers: {
      request: [] as OnRequestType[],
      message: [] as OnMessageType[],
      close: [] as OnCloseType[],
    } as { [key: string]: any[] },
    option: {
      logEnabled: true,
    },
  };

  const wss = new WebSocket.server({ httpServer });
  wss.on("request", (request) => _onRequest(__id++, request));

  function _onRequest(id: number, request: WebSocket.request) {
    const connection = request.accept(undefined, request.origin);
    state.connections[id] = connection;
    _log(`+ request : ${id}`);

    connection.on("message", (message) => _onMessage(id, message));
    connection.on("close", (_) => _onClose(id, _));

    state.eventHandlers.request.forEach((h) => h(id));
  }

  function _onMessage(id: number, message: WebSocket.IMessage) {
    _log(`---- message @${id} : ${message.utf8Data}`);
    state.eventHandlers.message.forEach((h) => h(id, message.utf8Data || ""));
  }

  function _onClose(id: number, _: number) {
    if (!state.connections[id]) {
      return;
    }
    _log(`- close : ${id}`);
    delete state.connections[id];

    state.eventHandlers.close.forEach((h) => h(id));
  }

  function _log(message: any) {
    if (state.option.logEnabled) {
      console.log(message);
    }
  }

  function _warn(message: any) {
    if (state.option.logEnabled) {
      console.warn(message);
    }
  }

  type OptionType = typeof state.option;
  function setOption(option: OptionType): DefaultType {
    state.option = { ...state.option, ...option };
    return self;
  }

  function send(dataString: string): DefaultType {
    for (const id in state.connections) {
      const c = state.connections[id];
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
    state.eventHandlers.request.push(handler);
    return self;
  }

  function addOnMessage(handler: OnMessageType): DefaultType {
    state.eventHandlers.message.push(handler);
    return self;
  }

  function addOnClose(handler: OnCloseType): DefaultType {
    state.eventHandlers.close.push(handler);
    return self;
  }

  function removeOn(eventName: string, handler: any): DefaultType {
    const ls = state.eventHandlers[eventName];
    if (ls) {
      const index = ls.findIndex((x) => x == handler);
      if (index != -1) {
        ls.splice(index, 1);
      }
    }

    return self;
  }

  const _ = {
    state,
  };

  const self = {
    _,
    setOption,
    send,
    close,
    addOnRequest,
    addOnMessage,
    addOnClose,
    removeOn,
  };

  return self;
}
