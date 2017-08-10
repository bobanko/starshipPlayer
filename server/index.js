const httpServer = require('./http-server');
const wsServer = require('./ws-server');

httpServer({port: 9080});

wsServer({port: 9091});
