module.exports = function (config, onData) {

    const http = require('http');
    const static = require('node-static');
    const file = new static.Server('.');

    http.createServer(function (req, res) {
        file.serve(req, res);
    }).listen(config.port);

    console.log(`Server running on http://localhost:${config.port}`);





};