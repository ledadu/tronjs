
var _ = require('underscore');


var HttpServer = require('./HttpServer');
var World = require('./World');




var httpServer = new HttpServer(8181);
httpServer.configure();

var world1 = new World(httpServer.io.of('/world1'));
world1.initSocket().serverRoutine();

var world2 = new World(httpServer.io.of('/world2'));
world2.initSocket().serverRoutine();


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

