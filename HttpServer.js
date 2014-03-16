var fs = require('fs');
var Handlebars = require('handlebars');


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

    this.app.get('/world/:worldId?', function(req, res) {
        fs.readFile(__dirname + '/templates/world.html.t', function(err, template_source) {
            if (err) {
                throw err;
            }
            var template = Handlebars.compile(template_source.toString());
            var template_data = req.route.params;
            var template_result = template(template_data);
            res.status(200).set('Content-Type', 'text/html').send(template_result);
        });

        //console.log();
        //res.sendfile(__dirname + '/public/index.html');
    });

    this.app.use(Express.static(__dirname + '/public'));


    that.io.configure('production', function() {
        that.io.set('log level', 1);
    });

};


module.exports = HttpServer;
