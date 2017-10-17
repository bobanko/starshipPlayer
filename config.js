const config = {
    wsPort: 8091,
    httpPort: 8080,
    videosDir: './videos/',
    //videosDir: './videos_test2/',
    // videosDir: './vids_test2/',
    videoSize: {width: 240, height: 144},

    // videosDir: './vids_test2/',
    // videoSize: {width: 352, height: 288},
};

config.port = config.wsPort;


module.exports = config;