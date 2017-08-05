const httpServer = require('./http-server');
const WsServer = require('./ws-server');

httpServer({port: 9080});

let wsServer1 = new WsServer({ port: 9091}); //server: httpServer, path: '/front',
//let wsServer2 = new WsServer({server: httpServer, path: '/back', port: 9091});
