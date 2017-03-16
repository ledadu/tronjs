var _ = require('underscore');
var extend = require('extend');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
//remove options!! must pass by collection parent
var Player = function(options) {

    var Model_base = require('./base');
    extend(true, this, new Model_base());

    //construct
     EventEmitter.call(this);

    //Put in function to todge 'Too much recurstion'
    this.getSocket = function(){return options.socket;};

    this.directionlist = ["left", "right", "up", "down"];
    this.id = this.makeid();
    this.name = this.id;
    this.x = 50;
    this.y = 50;
    this.score = 0;
    this.color = getRandomColor2();
    this.direction = "right";
    this.commandPool = [];
    this.currentCommand = "";
    this.activatePower = false;
    this.powerDuration = 100;
    this.powerMax = 300;
    this.powerStep = 0;
    this.powerCharge = 0;
    this.step = 0;  //live time
    this.class = null;
    this.class = "shooter";
    //this.class = "digger";
    //this.class = "speeder";
    //construct
}

//Player.prototype = new EventEmitter();
util.inherits(Player, EventEmitter);


Player.prototype.kill = function() {
    this.direction = "dead";
    console.log("kill player");
    this.emit('playerMove',this);
};

Player.prototype.spawn = function() {

    var world = this.getCollection().getParent();

    this.class = null;
    this.direction = _.sample(this.directionlist);
    this.x = 1/4 * world.width / world.pixelReso  +  Math.floor((world.width / world.pixelReso * 1/2) * Math.random());
    this.y = 1/4 * world.height / world.pixelReso  +  Math.floor((world.height / world.pixelReso * 1/2) * Math.random());
    this.step = 0;
};


/**
 * Player routine
 *
 *@return boolean = true if player has been updated
 */
Player.prototype.routine = function() {

    var world  = this.getCollection().getParent(),
        socket = this.getSocket();

    //inc power step
    if (this.powerStep < this.powerMax) {
        this.powerStep++;
    }

    //inc power
    if (!this.activatePower && !this.activatePower2 & this.powerCharge < this.powerMax) {
        this.powerCharge++;
    }

    //Step bypass
    if (this.class === 'speeder') {
        //normal speed
        if (world.heartbeat % 2 !== 0 && !this.activatePower2 && !this.activatePower) {
            return false;
        }
        //lower speed
        if (world.heartbeat % 4 !== 0 && !this.activatePower2 && this.activatePower) {
            return false;
        }
        //else fast speed
    } else {
        if (world.heartbeat % 2 !== 0) {
            return false;
        }
    }

    // sync move speed with pixelReso
    if (world.heartbeat % (world.pixelReso) !== 0)  {
        return false;
    }

    //------- Start player move ---------
    
    //get bonus
    var touchedBonus = world.boni.getEntityFromXY(this.x,this.y);
    if (!_.isNull(touchedBonus)) {
        //Apply player class of bonus
        if (touchedBonus.class === 'playerClass') {
            this.class = touchedBonus.value;
            socket.emit('showMessagesSreeen',{text: 'Got player class : ' + this.class, color:this.color});
        }
    }

    //Pop command of this
    this.currentCommand = this.commandPool.shift();

    //Start Power
    if (!_.isNull(this.class) && this.currentCommand == "activatePower") {
        if (!this.activatePower && this.powerCharge >= this.powerMax/2) {
            this.powerStep = 0;
            this.powerCharge -= this.powerMax/2;
            this.activatePower = true;
        }
    }

    //Start Power 2
    if (!_.isNull(this.class) && this.currentCommand == "activatePower2") {
        if (!this.activatePower2 && this.powerCharge >= this.powerMax) {
            this.powerStep = 0;
            this.powerCharge = 0;
            this.activatePower2 = true;
        }
    }
    //Stoping power
    if (this.activatePower && this.powerStep >= this.powerDuration) {
        this.activatePower = false;
        this.powerStep = 0;
    }

    //Stoping power 2
    if (this.activatePower2 && this.powerStep >= this.powerDuration*(this.class==='speeder' ? 2 : 1)) {
        this.activatePower2 = false;
        this.powerStep = 0;
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
                //socket.emit('showMessagesSreeen',{text: this.currentCommand, color:this.color});
                //world.ioNamespace.emit('showMessagesSreeen',{text: this.currentCommand, color:this.color});
        }

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

    if (world.bmp[this.x] == undefined) {
        world.bmp[this.x] = [];
    }

    if (this.direction != "dead"){

        //Inc player step
        this.step++;

        //Manage player death colision
        if (
            this.x < 0 || this.x * world.pixelReso > world.width ||
            this.y < 0 || this.y * world.pixelReso > world.height ||
            world.bmp[this.x][this.y] != null && world.bmp[this.x][this.y].color.solid
        ) {
            if (this.class == 'digger'){
                if (!this.activatePower && !this.activatePower2) {
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

    this.color = this.baseColor;
    this.color.a = 1;
    this.color.solid = true;

    var previous = {
            x: (this.x + (this.direction === 'left' ? 1 : 0) + (this.direction === 'right' ? -1 : 0)),
            y: (this.y + (this.direction === 'up'   ? 1 : 0) + (this.direction === 'down'  ? -1 : 0))
        },
        darkenColor  = darken(this.color, 0.5),
        lightenColor = lighten(this.color, 0.5);

    //Digger class
    if (this.class == 'digger'){

        if (this.activatePower) {

            if(this.powerStep === 0) {
                world.bmp[previous.x][previous.y] = {playerid :this.id ,color:_.clone(darkenColor)};
                world.ioNamespace.emit('updateBmpPixel', {x: previous.x, y: previous.y, content: world.bmp[previous.x][previous.y]});
            } 
            this.color.a = 0.15;
            this.color.solid = false;
        }else if(this.activatePower2){
                this.color = lightenColor;
        }else {
            if(this.powerStep === 0) {
                this.color = darkenColor;
            } 

        }
    }

    //Speeder class
    if (this.class == 'speeder'){
        if (this.activatePower || this.activatePower2) {
            this.color = lightenColor;
        }

    }

    //No class
    world.bmp[this.x][this.y] = {playerid :this.id ,color:_.clone(this.color)};

    return true;

};

Player.prototype.initPlayerColor = function() {
    var palette = [
        '9E4A08',   //orange
        '000b94',   //blue
        '947400',   //yellow
        '77089e',   //purple
        '08899e',   //light blue
        '870000',   //red
        '00872a',   //green
    ],
//        playerIndex = _.keys(this.getCollection().list).indexOf(this.id);
        playerIndex = Math.round(Math.random() * palette.length);

    this.baseColor = hexToColor(palette[playerIndex]);
    return true;
}

module.exports = Player;

function hexToColor(hex) {
    if (_.isUndefined(hex)) {
        return {
            r: 128,
            g: 128,
            b: 128,
            a: 1,
        };
    }
    var hexCutted = hex.match(/.{1,2}/g);
    return {
        r: parseInt(hexCutted[0],16),
        g: parseInt(hexCutted[1],16),
        b: parseInt(hexCutted[2],16),
    };
}


function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}



function getRandomColor2() {
    return {
        r: 128 + Math.round(Math.random()*64),
        g: 128 + Math.round(Math.random()*64),
        b: 128 + Math.round(Math.random()*64),
    };
}


function darken(color,force) {
    return _.mapObject(_.clone(color), function(value) {
        return Math.round(value - force * value);
    });
};

function lighten(color,force) {
    return _.mapObject(_.clone(color), function(value) {
        return Math.round(value + force * (255-value));
    });
};

