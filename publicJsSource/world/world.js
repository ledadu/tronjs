
function update() {

 graphics.angle++;
}

function render() {

}

var fff = new (function(){

    var that = this,
        keyFunctions = {
            37: "left",
            39: "right",
            38: "up",
            40: "down",
            27: "clear",
            65: "activatePower",
            90: "activatePower2"
        },
        world,
        currentPlayerId = null,
        screenMessages  = [];


    this.players  = {},
    this.boni     = {};
    this.missiles = {};

    this.socket;
    $(document).ready(function() {

        that.initSocket();
        that.initKeyBinding();
        that.bindChangeName();

    });


    this.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'Tron', { create: createGame, update: _.noop, render: _.noop});

    function createGame() {

    }

/*
    function doTouchStart() {
        event.preventDefault();
        canvas = event.target;
        var c = new Vector(event.targetTouches[0].pageX, event.targetTouches[0].pageY);

        //matrice centre
        var mc = new Vector(canvas.width / 2, canvas.height / 2);

        var mdc = c.sub(mc);	// return mc - c

        var ctr2cornr = {};
        ctr2cornr.UR = new Vector(mc.x, -mc.y);
        ctr2cornr.DL = ctr2cornr.UR.inv();
        ctr2cornr.UL = new Vector(-mc.x, -mc.y);
        ctr2cornr.DR = ctr2cornr.UL.inv();



        var cornerline = _.find(
                [ctr2cornr.DL, ctr2cornr.DR, ctr2cornr.UR, ctr2cornr.UL],
                function(n) {
                    if (mdc.angle() > n.angle()) {
                        return true
                    }
                }
        );

        keyFunction = "left"

        if (cornerline == ctr2cornr.DR) {
            keyFunction = "down";
        }

        if (cornerline == ctr2cornr.UR) {
            keyFunction = "right";
        }

        if (cornerline == ctr2cornr.UL) {
            keyFunction = "up";
        }

        this.socket.emit('touchup', {coord: c, keyFunction: keyFunction});

    }
*/
    this.initWorld = function(world) {

        var that = this;

        if(_.isUndefined(this.graphics)) {
            this.graphics = this.game.add.graphics(0, 0);
        }

        if(_.isUndefined(this.graphics2)) {
            this.graphics2 = this.game.add.graphics(0, 0);
        }

        //App.layer2.addEventListener("touchstart", doTouchStart, false);

        this.graphics.clear();
        $.each(world.bmp, function(x, cc) {
            if (cc != null) {
                $.each(cc, function(y, pixel) {
                    if (x != null && y != null && pixel != null) {
                        that.graphics.beginFill(getIntColor(pixel.color), pixel.color.a);
                        that.graphics.drawCircle(x * world.pixelReso, y * world.pixelReso,world.pixelReso);
                    }
                });
            }
        }); 

    }

    function putmessage(textMess) {
        screenMessages.push({text: textMess.text, times: 500, color: textMess.color});
    };

    this.initKeyBinding = function() {
        $(document).keydown(function(a) {
            keyFunction = '---';
            if (keyFunctions[a.which] != undefined) {
                keyFunction = keyFunctions[a.which];
            }
            that.socket.emit('keydown', {keycode: a.which, keyFunction: keyFunction});
        });
    }

    this.refreshLayer = function() {

        var that = this,
            currentPlayer = this.players[currentPlayerId];

        this.graphics2.clear();
        this.graphics2.removeChildren();


        //show player neme
        $.each(this.players, function(playerName, player) {
            that.graphics2.addChild(that.game.add.text(player.x * world.pixelReso, player.y * world.pixelReso, player.name + '(' + player.score + ')', {font: "10px Arial", fill: "#ffffff"}));
        });


        //Show powerState
        if (!_.isUndefined(currentPlayer)) {
            that.graphics2.addChild(that.game.add.text(0, 580, Math.round(currentPlayer.powerCharge / currentPlayer.powerMax*100),   {font: "italic 20px Arial", fill: "#ffffff"}));
        }

        // show screen message
        $.each(screenMessages, function(num, mess) {
            var alpha     = (mess.times / 500),
                color     = mess.color,
                fillStyle = writeRgbStyle(color, alpha),
                font      = "italic 20px Arial";

            that.graphics2.addChild(that.game.add.text(20, 20 + num *20 ,mess.text, {font: font, fill: fillStyle}));
            mess.times -= 5;

            if (mess.times < 10) {
                screenMessages = _.without(screenMessages, mess);
            }
        });

        //Show bonus
        _.each(this.boni, function(bonus){
            var color = {
                r: 64 + Math.round(Math.random()*128),
                g: 64 + Math.round(Math.random()*128),
                b: 64 + Math.round(Math.random()*128),
            };

            that.graphics2.beginFill(getIntColor(color), 1);
            that.graphics2.drawCircle(bonus.x * world.pixelReso, bonus.y * world.pixelReso, world.pixelReso);
        });


       //Show missiles
        _.each(this.missiles, function(missile){
            that.graphics2.beginFill(getIntColor(missile.color), 1);
            that.graphics2.drawCircle(missile.x * world.pixelReso, missile.y * world.pixelReso, world.pixelReso);
        });


    }

    this.bindChangeName = function() {
        $('.sendValue').bind('submit', function(e) {
            return false;
        });

        $('.sendValue').bind('click', function(e) {
            $form = $(e.currentTarget).closest('form');
            this.socket.emit("sendValue", $form.serializeArray());
        });

    }

    this.initSocket = function() {

        var that = this;

        this.socket = io.connect('http://'+ location.host + '/world' + worldId ),
                text = $('#text');
        //connected BIND
        this.socket.on('connect', function() {
            console.log("connected");
            text.html('connected');
        });

        //Trigger at the connection
        this.socket.on('initParam', function(params) {
            currentPlayerId = params.player_id;
        });

        //Message BIND
        this.socket.on('message', function(msg) {
            text.html(msg);
        });

        //Debug BIND
        this.socket.on('debug', function(msg) {
            console.log(msg);
        });

        //Disconect BIND
        this.socket.on('disconnect', function() {
            console.log("disconnected");
            text.html('disconnected');
        });

        //Reset caneva by server
        this.socket.on('initWorld', function(worldObj) {
            world = worldObj;
            this.players = {};
            that.initWorld(world);
        });

        this.socket.on('updateBmpPixel', function(bmpPixel) {
//            world[bmpPixel.x][bmpPixel.y] = bmpPixel.content;
            that.graphics.beginFill(getIntColor(bmpPixel.content.color), bmpPixel.content.color.a);
            that.graphics.drawCircle(bmpPixel.x * world.pixelReso, bmpPixel.y * world.pixelReso,world.pixelReso);

        });

        //Update all players
        this.socket.on('entitiesUpdate', function(entities) {
            _.each(entities.players, function(player){
                that.playerUpdate(player);
            });

            that.boni = {};
            _.each(entities.boni, function(bonus){
                that.boni[bonus.id] = bonus;
            });

            that.missiles = {};
            _.each(entities.missiles, function(missile){
                that.missiles[missile.id] = missile;
            });

            that.refreshLayer();
        });

        //Update a player
        this.socket.on('playerUpdate', function(player) {
            that.playerUpdate(player);
            that.refreshLayer();
        });

        //On opponnet quit
        this.socket.on('playerQuit', function(player) {
            delete this.players[player.id];
        });

        //Show message on screen
        this.socket.on('showMessagesSreeen', function(textMess) {
            putmessage(textMess);
        });
    };

    this.playerUpdate = function(player) {

        var playerX = player.x * world.pixelReso,
            playerY = player.y * world.pixelReso;

        this.graphics.beginFill(getIntColor(player.color), player.color.a);
        this.graphics.drawCircle(playerX, playerY, world.pixelReso);

        this.players[player.id] = player;
    };

    this.bonusUpdate = function(bonus) {
    };

    function darken(color,force) {
        return _.mapObject(color, function(value) {
            return Math.round(value - force * value);
        });
    };

    function writeRgbStyle(color, alpha){
        if (_.isUndefined(alpha)) {
            return 'rgb(' +color.r + ',' + color.g + ',' + color.b + ')';
        }
        return 'rgba(' +color.r + ',' + color.g + ',' + color.b + ',' + alpha + ')';
    };

    function getIntColor(color, alpha){

        var toHex = function(int){return (int < 16 ? '0' : '') + int.toString(16);},
            colorHex = toHex(color.r) + toHex(color.g) + toHex(color.b);

        return parseInt(colorHex,16);
    };


})();






