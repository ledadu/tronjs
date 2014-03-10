var fs = require('fs');

var HttpServer = function() {
    //construct
    this.server = require('http').createServer(handler);
};

module.exports = HttpServer;




function handler(req, res) {    
    if (req.url == '/') {
        req.url = '/index.html';
    }
    
    console.log(__dirname + '/public' + req.url);
    fs.readFile(__dirname + '/public' + req.url,
            function(err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading index.html');
                }

                res.writeHead(200);
                res.end(data);
            });
}
