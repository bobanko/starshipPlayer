const httpServer = require('./http-server');
const WsServer = require('./ws-server');


let wsServer = new WsServer({port: 9090});

httpServer({port: 9080}, (data) => wsServer.send(data));