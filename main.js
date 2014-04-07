
var _ = require('underscore');


var HttpServer = require('./HttpServer');
var World = require('./World');
var Lobby = require('./Lobby');
var CompilePublicJs = require('./CompilePublicJs');

var compilePublicJs = new CompilePublicJs();
compilePublicJs.addFolderSource('./publicJsSource/world');
compilePublicJs.compileUglifyJs('./public/');

var httpServer = new HttpServer(8181);

var worlds = new Array();

for (idWorld = 1; idWorld < 33; idWorld++) {
    worlds.push( new World(httpServer.io.of('/world' + idWorld),idWorld) );
}

var lobby = new Lobby( httpServer.io.of('/lobby') , worlds );

httpServer.configure({worlds:lobby.worlds});

_.each(worlds,function(world){
    world.initSocket().serverRoutine();
})

lobby.initSocket();

var Model_User = require('./model/User.js');
var user = new Model_User();

//new user
user.name = 'guest' + Math.random();
//user.id_user = 2;
user.save(function(saved_user){
    user = saved_user;
    console.log(saved_user);
});





/*
 * 
 *          en mode coop :
 
 idee match scoring avec bot // necessice un lobby
 t = temps propre de survi;
 n = nombre de joueurs;
 T = temps de mort du BOT sinon 0
 B = 10 ;bonnus de temps de survi pour vaincu le BOT
 
 score = t + T * B/n
 
 revision de la formule, il faut que le score soit inverse par rapport au temp de mort du bot !
 score peut prendre comme base le nombre de pixel du monde ^^
 idee teaser sure le score victoire sur le screen ^^
 bonusvictoire = (totalpixel - tempmortbo * nombredeplayers) * 10
 scorevictoire = tempdesurvi + bonusvictoire
 scoremort = tempdesurvi + bonusvictoire
 
 
 
 en mode pvp :
 idee bonus
 * rocket
 * laser
 idee neutrus
 * mode rainbow
 idee malus
 * inversion commande
 
 
 ajout d'un mode superWorm, idem au bot, avec un worms cheaté piloté par un humain
 
 To do :
 * ajouter un lobby de connection
 * ajout d'object et d'items
 * gestion d'un monde avec scrolling
 * un fond pour le scrolling
 * 
 */

