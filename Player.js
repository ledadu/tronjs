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
    this.speed = 5;
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
    this.x = 50 + 5 * Math.floor((world.width - 100) / 5 * Math.random());
    this.y = 50 + 5 * Math.floor((world.height - 100) / 5 * Math.random());
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
