var fs = require('fs');

var _ = require('underscore');
var util = require('util');
var Express       = require('express'),
    session       = require('express-session'),
    //RedisStore    = require('connect-redis')(Express),
    sessionStore  = new session.MemoryStore(),
    Cookie        = require('cookie'),
    cookieParser  = require('cookie-parser'),
    COOKIE_SECRET = 'secret',
    COOKIE_NAME   = 'sid';

var Handlebars = require('handlebars');
var Model_User = require('./model/User.js');

var HttpServer = function(tcport) {
    var that = this;
    //Load Express http framework
    this.app = new Express();
    this.sessionPool = {};

    this.app.use(cookieParser(COOKIE_SECRET));

    this.app.use(session({
        name: COOKIE_NAME,
        store: sessionStore,
        //store: new RedisStore(),
        secret: COOKIE_SECRET,
        saveUninitialized: true,
        resave: true,
        cookie: {
            path: '/',
            httpOnly: true,
            secure: false,
            maxAge: null
        }
    }));

    // create server
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

    //io authorization (getting session)
    that.io.set('authorization', function (handshakeData, callback) {

        console.log('## socket.IO ##  (authorization)');

        var sid = that.getSID(handshakeData.headers.cookie);
        
//        console.log('session : ',that.getSessionFromSID(sid));
        
        callback(null, true); // error first, 'authorized' boolean second 
    });
    
};


HttpServer.prototype.getSessionFromSID = function(sid,cb){
    // cb = function(err, session)
    sessionStore.get(sid, cb);
}


/*
 * Lobby page
 */
HttpServer.prototype.configureLobbyPage = function(param) {
    var that = this;
    this.app.get('/', function(req, res) {
        var template_data = {worlds:[]};
        _.each(param.worlds, function(world) {
            var worldData = {
                id        : world.id,
                gameMode  : world.gameMode,
                players   : world.players.list,
                nbPlayers : _.keys(world.players.list).length,
            };
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
        //that.sessionInit(req);
        //req.session.tron_Sess_ID = req.cookies['tronSess'] ;
        var template_data = req.params;

        if(!_.isUndefined(req.session.id_user)){
            template_data.id_user = req.session.id_user;
        }

        if(_.isUndefined(req.session.name)){
            req.session.name = makeid();
        }

        template_data.name    = req.session.name;

        console.log('## HTTP ## (world)');     
        console.log('session : ', JSON.stringify(req.session));
        
        var sid = that.getSID(req.headers.cookie);

        that.sendTemplate(template_data, 'world.html', res);
    });
}

HttpServer.prototype.getSID = function(cookie) {

    //console.log('*** GET SID from cookie ****');
    if (_.isUndefined(cookie)) {
        return null;
    }
    var cookies = Cookie.parse(cookie);
    if (! cookies[COOKIE_NAME]) {
        return next(new Error('Missing cookie ' + COOKIE_NAME));
    }
    var sid = cookieParser.signedCookie(cookies[COOKIE_NAME], COOKIE_SECRET);
    if (! sid) {
        return next(new Error('Cookie signature is not valid'));
    }
    console.log('----> session ID ( %s )', sid);
    return sid;

}


/*
 * login page
 */
HttpServer.prototype.configureLoginPage = function(param) {
     var that = this;
     this.app.get('/login/:email?/password/:password?', function(req, res) {
        var template_data = req.params;
        var user = new Model_User();
        user.login(template_data.email,template_data.password,
                       function(){
                            template_data.user  = this;
                            req.session.id_user = this.id_user; 
                            req.session.name    = this.name; 
                            that.sendTemplate(template_data, 'login.html', res);
        
                            console.log('## HTTP ## (login)');     
                            console.log('session : ', JSON.stringify(req.session))
        
                            that.getSID(req.headers.cookie);
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

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = HttpServer;

