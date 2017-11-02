const http = require('http');
const static = require('node-static');

//just static node server to host html, may be altered by webpack dev server
module.exports = function (config) {

    const file = new static.Server('.');

    http.createServer(function (req, res) {
        file.serve(req, res);
    }).listen(config.port);

    console.log(`Server running on http://${config.hostName}:${config.port}`);
};