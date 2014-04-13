var fs = require('fs');

var _ = require('underscore');
var Express = require('express');
var RedisStore = require('connect-redis')(Express);

var Handlebars = require('handlebars');
var Model_User = require('./model/User.js');

var HttpServer = function(tcport) {
    //construct
    //this.server = require('http').createServer(handler);    
    this.app = new Express();
    this.app.use(Express.cookieParser());
    this.app.use(Express.session(
                                    {store: new RedisStore(),
                                     secret:'Nibble_S3rcret'
                                    }
                                )
                );
    this.server = require('http').createServer(this.app);
    this.server.listen(tcport);
    this.io = require('socket.io').listen(this.server);
};

/*
 * init of routing HttpServer
 */
HttpServer.prototype.configure = function(param) {
    var that = this;
    that.configureLobbyPage(param);
    that.configureWorldPage();
    that.configureLoginPage();
    this.app.use(Express.static(__dirname + '/public'));

    that.io.configure('production', function() {
        that.io.set('log level', 1);
    });
};

/*
 * Lobby page
 */
HttpServer.prototype.configureLobbyPage = function(param) {
    var that = this;
    this.app.get('/', function(req, res) {
        var template_data = {worlds:[]};
        _.each(param.worlds, function(world) {
		var worldData = {};
		worldData.id=world.id;
		worldData.gameMode = world.gameMode;
		worldData.players = world.players.list;
		worldData.nbPlayers = _.keys(world.players.list).length;
		template_data.worlds.push(worldData);
        });

        that.sendTemplate(template_data, 'lobby.html', res)
        //res.sendfile(__dirname + '/public/index.html');
    });
}

/*
 * world page
 */
HttpServer.prototype.configureWorldPage = function(param) {
     var that = this;
     this.app.get('/world/:worldId?', function(req, res) {
        var template_data = req.route.params;
        console.log(req.session);
        that.sendTemplate(template_data, 'world.html', res)
    });
}

/*
 * login page
 */
HttpServer.prototype.configureLoginPage = function(param) {
     var that = this;
     this.app.get('/login/:email?/password/:password?', function(req, res) {
        var template_data = req.route.params;
        var user = new Model_User();
        user.login(template_data.email,template_data.password,
                       function(){
                            template_data.user = this;
                            console.log(req);
                            req.session.id_user = this.id_user; 
                            that.sendTemplate(template_data, 'login.html', res);
                       }
                  );
    });
}


/* 
 * Http response + template
 */
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

