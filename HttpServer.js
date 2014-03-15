//var fs = require('fs');


var Express = require('express');
var HttpServer = function(tcport) {
    //construct
    //this.server = require('http').createServer(handler);    
    this.app = new Express();
    this.server = require('http').createServer(this.app);    
    this.server.listen(tcport);
    this.io = require('socket.io').listen(this.server);
};


HttpServer.prototype.configure = function() {
    var that = this;
//    this.app.use(function(req, res, next){
//        if (req.path == '/') {
//            req.path = '/index.html';
//        }
//        console.log(req.query);
//        res.sendfile(__dirname + '/public' + req.path);
//      });
      

      
      this.app.get('/world/:world?', function(req, res){
          console.log(req.route.params);
        res.sendfile(__dirname + '/public/index.html');
      });
//  this.app.set('views', __dirname + '/views');
//  that.server.set('view engine', 'jade');
//  this.app.use(Express.favicon());
//  that.server.use(Express.logger('dev'));
    this.app.use(Express.static(__dirname + '/public'));
//  that.server.use(Express.bodyParser());
//  that.server.use(Express.methodOverride());
//  that.server.use(that.server.router);

   // that.server.listen(that.tcpPort);
    that.io.configure('production', function() {
        that.io.set('log level', 1);
    });
    
};


module.exports = HttpServer;
