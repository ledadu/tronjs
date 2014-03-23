var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Player = function() {
    //construct
 EventEmitter.call(this);
    this.directionlist = ["left", "right", "up", "down"];
    this.id = makeid();
    this.name = this.id;
    this.x = 50;
    this.y = 50;
    this.score = 0;
    this.color = getRandomColor();
    this.direction = "right";
    this.speedStep = 5;
    this.step = 0;
    //construct
}

//Player.prototype = new EventEmitter();
util.inherits(Player, EventEmitter);

Player.prototype.kill = function() {
    this.direction = "dead";
    console.log("kill player");
    this.emit('playerMove',this);
};

Player.prototype.spawn = function(world) {
    this.direction = _.sample(this.directionlist);
    //this.x = 10 * world.pixelReso +  Math.floor((world.width - 20 * world.pixelReso) /  world.pixelReso * Math.random());
    //this.y = 10 * world.pixelReso +  Math.floor((world.height - 20 * world.pixelReso) /  world.pixelReso * Math.random());
    this.x = 1/4 * world.width / world.pixelReso  +  Math.floor((world.width / world.pixelReso * 1/2) * Math.random());
    this.y = 1/4 * world.height / world.pixelReso  +  Math.floor((world.height / world.pixelReso * 1/2) * Math.random());
    this.step = 0;
}

module.exports = Player;

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}


function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
