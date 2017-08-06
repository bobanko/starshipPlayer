const httpServer = require('./http-server');
const WsServer = require('./ws-server');

httpServer({port: 9080});

let wsServer = new WsServer({port: 9091});
