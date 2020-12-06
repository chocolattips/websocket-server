Wrap for websocket.

## usage

### install

```
cd path/to/websocket-server
npm install
```

### import

```ts
import useWebSocketServer from "websocket-server";
```

### run server

```ts
const ws = useWebSocketServer();
```

### add callback / send message

```ts
ws.addOnMessage((param) => {
  if (param.message) {
    ws.send(param.message);
  }
});
```

## option

### run server

#### port

```ts
const port = 3000;
const ws = useWebSocketServer(port);
```

#### httpServer

```ts
import Http from "http";
```

```ts
const port = 3000;
const httpServer = Http.createServer();
httpServer.listen(port);

const ws = useWebSocketServer(httpServer);
```
