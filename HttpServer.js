var fs = require('fs');

var HttpServer = function() {
    this.server = require('http').createServer(handler);
};

module.exports = HttpServer;




function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
            function(err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading index.html');
                }
                console.log(req.url);
                res.writeHead(200);
                res.end(data);
            });

}