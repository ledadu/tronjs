var _       = require('underscore');
var util    = require('util');
var connect = require('connect')
var http    = require('http')

var app = connect()

// gzip/deflate outgoing responses
var compression = require('compression')
app.use(compression())

// store session state in browser cookie
var cookieSession = require('cookie-session')
 app.use(cookieSession({
     keys: ['secret1', 'secret2']
     }))

     // parse urlencoded request bodies into req.body
     var bodyParser = require('body-parser')
     app.use(bodyParser.urlencoded())

     // respond to all requests
     app.use(function(req, res){
        console.log(
            'session : ', 
            _.keys(req.session)
        );
        var n = req.session.views || 0;
        n = (n >= 10) ? 0 : n;
        req.session.views = ++n; 
        res.end(n + ' views');    
     })

       //create node.js http server and listen on port
       http.createServer(app).listen(3000)
