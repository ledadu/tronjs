//var fs = require('fs');


var HttpServer = function(tcport) {
    //construct
    //this.server = require('http').createServer(handler);
    this.app = require('express')();
    this.server = require('http').createServer(this.app);    
    this.server.listen(tcport);
};


HttpServer.prototype.configure = function() {

    this.app.use(function(req, res, next){
        if (req.url == '/') {
            req.url = '/index.html';
        }
        console.log(req.url);
        res.sendfile(__dirname + '/public' + req.url);
      });
//  that.server.set('views', __dirname + '/views');
//  that.server.set('view engine', 'jade');
//  that.server.use(Express.favicon());
//  that.server.use(Express.logger('dev'));
//  that.server.use(Express.static(__dirname + '/public'));
//  that.server.use(Express.bodyParser());
//  that.server.use(Express.methodOverride());
//  that.server.use(that.server.router);

};


module.exports = HttpServer;
