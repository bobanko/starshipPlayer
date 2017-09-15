const httpServer = require('./http-server');
const wsServer = require('./ws-server');

const config = require('../config');

//httpServer({port: config.httpPort});

wsServer(config);
