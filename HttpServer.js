var fs = require('fs');
var _ = require('underscore');
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


HttpServer.prototype.configure = function(param) {
    var that = this;
    that.configureLobbyPage(param);
    that.configureWorldPage();
    this.app.use(Express.static(__dirname + '/public'));

    that.io.configure('production', function() {
        that.io.set('log level', 1);
    });
};

HttpServer.prototype.configureLobbyPage = function(param) {
    var that = this;
    this.app.get('/', function(req, res) {
        var ulListHtml = '<ul>';
        _.each(param.worlds, function(world) {
            ulListHtml += '<li><a href=/world/' + world.id + '>room' + world.id + '</a> <div class="gameMode">' + world.gameMode + '</div></li>'
        });
        ulListHtml += '</ul>';

        var template_data = {listRoom: ulListHtml};
        that.sendTemplate(template_data, 'lobby.html', res)
        //res.sendfile(__dirname + '/public/index.html');
    });
}

HttpServer.prototype.configureWorldPage = function(param) {
     var that = this;
     this.app.get('/world/:worldId?', function(req, res) {
        var template_data = req.route.params;
        that.sendTemplate(template_data, 'world.html', res)
    });
}

HttpServer.prototype.sendTemplate = function(template_data, templateName, response) {
    fs.readFile(__dirname + '/templates/' + templateName + '.t', function(err, template_source) {
        if (err) {
            throw err;
        }
        var template = Handlebars.compile(template_source.toString());
        response.status(200).set('Content-Type', 'text/html').send(
                template(template_data)
                );
    })
            ;
}

module.exports = HttpServer;
