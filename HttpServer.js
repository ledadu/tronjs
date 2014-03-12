var fs = require('fs');
var Express = require('express');


var HttpServer = function() {
    //construct
    //this.server = require('http').createServer(handler);
    this.server = new Express();
};


HttpServer.prototype.configure = function() {
var that = this;
this.server.configure(function(){
//  that.server.set('views', __dirname + '/views');
//  that.server.set('view engine', 'jade');
//  that.server.use(Express.favicon());
//  that.server.use(Express.logger('dev'));
//  that.server.use(Express.static(__dirname + '/public'));
//  that.server.use(Express.bodyParser());
//  that.server.use(Express.methodOverride());
//  that.server.use(that.server.router);
that.server.get('/',handler);
});

}
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
