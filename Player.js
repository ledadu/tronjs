var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Player = function(options) {
    //construct
     EventEmitter.call(this);

    //Put in function to todge 'Too much recurstion'
    this.getWorld  = function(){return options.world;};
    this.getSocket = function(){return options.socket;};

    this.directionlist = ["left", "right", "up", "down"];
    this.id = makeid();
    this.name = this.id;
    this.x = 50;
    this.y = 50;
    this.score = 0;
    this.color = getRandomColor();
    this.direction = "right";
    this.commandPool = [];
    this.currentCommand = "";
    this.activatePower = false;
    this.powerDuration = 5;
    this.powerCharge = this.powerDuration * 10;
    this.powerStep = 0;
    this.step = 0;
    this.class = "digger";
    /*this.class = "speeder";*/
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
    this.x = 1/4 * world.width / world.pixelReso  +  Math.floor((world.width / world.pixelReso * 1/2) * Math.random());
    this.y = 1/4 * world.height / world.pixelReso  +  Math.floor((world.height / world.pixelReso * 1/2) * Math.random());
    this.step = 0;
};

Player.prototype.routine = function() {

    var world  = this.getWorld(),
        socket = this.getSocket();

    //increment step
    this.step++;

    if(this.step>this.speedStep){

        //Pop command of this
        this.currentCommand = this.commandPool.shift();

        //inc power step
        if (this.powerStep < this.powerCharge) {
            this.powerStep++;
        }

        //Start Power
        if (this.currentCommand == "activatePower") {
            if (!this.activatePower && this.powerStep >= this.powerCharge) {
                this.powerStep = 0;
                this.activatePower = true;
            }
        }

        //Set player direction
        if (_.contains(this.directionlist, this.currentCommand)) {

            if (
                    (
                            (this.currentCommand == "left" || this.currentCommand == "right") &&
                            (this.direction == "up" || this.direction == "down")
                            )
                    ||
                    (
                            (this.currentCommand == "up" || this.currentCommand == "down") &&
                            (this.direction == "left" || this.direction == "right")
                            )
                    ) {

                this.direction = this.currentCommand;
                    socket.emit('showMessagesSreeen',{text: this.currentCommand, color:this.color});
                    //world.ioNamespace.emit('showMessagesSreeen',{text: this.currentCommand, color:this.color});
            }
            return;


        }

        //disable stoping power
        if (this.activatePower && this.powerStep >= this.powerDuration) {
            this.activatePower = false;
            this.powerStep = 0;
        }



        //Move player
        switch (this.direction) {
            case "right":
                this.x ++;
                break;
            case "left":
                this.x --;
                break;
            case "up":
                this.y --;
                break;
            case "down":
                this.y ++;
                break;
        }

        //reset player step
        this.step=0;

        if (world.bmp[this.x] == undefined) {
            world.bmp[this.x] = [];
        }

        if (this.direction != "dead"){
            //Manage player death colision
            if (
                this.x < 0 || this.x * world.pixelReso > world.width ||
                this.y < 0 || this.y * world.pixelReso > world.height ||
                world.bmp[this.x][this.y] != null
            ) {
                if (this.class == 'digger'){
                    if (!this.activatePower) {
                        this.kill();
                        world.ioNamespace.emit('showMessagesSreeen', {text: this.id + ' ☹', color: this.color});
                    }
                } else {
                    this.kill();
                    world.ioNamespace.emit('showMessagesSreeen', {text: this.id + ' ☹', color: this.color});
                }

            }
        }

        //Manage Bitmap change
        if (this.class == 'digger'){
            if (!this.activatePower) {
                world.bmp[this.x][this.y] = {playerid :this.id ,color:this.color};
            }
        } else {
            world.bmp[this.x][this.y] = {playerid :this.id ,color:this.color};
        }

        //What!!!!!!!!
        if (_.contains(this.directionlist, this.direction)) {
            /*world.players.list[this.id] = this;*/
            world.ioNamespace.emit('playerUpdate', this);
        }

    }


};



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
