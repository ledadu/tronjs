
var _ = require('underscore');

var World = require('./World');



var numplayercount = 0;
var world = new World();
world.initSocket();





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
 
 To do :
 * ajouter un lobby de connection
 * ajout d'object et d'items
 * gestion d'un monde avec scrolling
 * un fond pour le scrolling
 * 
 */

