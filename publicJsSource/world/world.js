
function update() {

 graphics.angle++;
}

function render() {

}


(function(){

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
        players         = {},
        currentPlayerId = null,
        screenMessages  = [];


    this.boni = {};

    var socket;
    $(document).ready(function() {

        that.initSocket();
        initKeyBinding();
        bindChangeName();

    });


    this.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'Tron', { create: createGame, update: _.noop, render: _.noop});

    function createGame() {

    }

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

        socket.emit('touchup', {coord: c, keyFunction: keyFunction});

    }

    function initWorld(world) {

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

    function initKeyBinding() {
        $(document).keydown(function(a) {
            keyFunction = '---';
            if (keyFunctions[a.which] != undefined) {
                keyFunction = keyFunctions[a.which];
            }
            socket.emit('keydown', {keycode: a.which, keyFunction: keyFunction});
        });
    }

    function refreshLayer() {

        var that = this,
            currentPlayer = players[currentPlayerId];

        this.graphics2.clear();
        this.graphics2.removeChildren();


        //show player neme
        $.each(players, function(playerName, player) {
            that.graphics2.addChild(that.game.add.text(player.x * world.pixelReso, player.y * world.pixelReso, player.name + '(' + player.score + ')', {font: "10px Arial", fill: "#ffffff88"}));
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
    }

    function bindChangeName() {
        $('.sendValue').bind('submit', function(e) {
            return false;
        });

        $('.sendValue').bind('click', function(e) {
            $form = $(e.currentTarget).closest('form');
            socket.emit("sendValue", $form.serializeArray());
        });

    }

    this.initSocket = function() {

        var that = this;

        socket = io.connect('http://'+ location.host + '/world' + worldId ),
                text = $('#text');
        //connected BIND
        socket.on('connect', function() {
            console.log("connected");
            text.html('connected');
        });

        //Trigger at the connection
        socket.on('initParam', function(params) {
            currentPlayerId = params.player_id;
        });

        //Message BIND
        socket.on('message', function(msg) {
            text.html(msg);
        });

        //Debug BIND
        socket.on('debug', function(msg) {
            console.log(msg);
        });

        //Disconect BIND
        socket.on('disconnect', function() {
            console.log("disconnected");
            text.html('disconnected');
        });

        //Reset caneva by server
        socket.on('initWorld', function(worldObj) {
            world = worldObj;
            players = {};
            initWorld(world);
        });

        socket.on('updateBmpPixel', function(bmpPixel) {
//            world[bmpPixel.x][bmpPixel.y] = bmpPixel.content;
            that.graphics.beginFill(getIntColor(bmpPixel.content.color), bmpPixel.content.color.a);
            that.graphics.drawCircle(bmpPixel.x * world.pixelReso, bmpPixel.y * world.pixelReso,world.pixelReso);

        });

        //Update all players
        socket.on('playersUpdate', function(players) {
            _.each(players, function(player){
                playerUpdate(player);
            });
            refreshLayer();
        });

        //Update a player
        socket.on('playerUpdate', function(player) {
            playerUpdate(player);
            refreshLayer();
        });

        //On opponnet quit
        socket.on('playerQuit', function(player) {
            delete players[player.id];
        });

        //Update all boni
        socket.on('boniUpdate', function(boniList) {
            that.boni = {};
            _.each(boniList, function(bonus){
                that.bonusUpdate(bonus);
            });
            refreshLayer();
        });

        //Show message on screen
        socket.on('showMessagesSreeen', function(textMess) {
            putmessage(textMess);
        });
    };

    function playerUpdate(player) {

        var playerX = player.x * world.pixelReso,
            playerY = player.y * world.pixelReso;

        this.graphics.beginFill(getIntColor(player.color), player.color.a);
        this.graphics.drawCircle(playerX, playerY, world.pixelReso);

        players[player.id] = player;
    };

    this.bonusUpdate = function(bonus) {
        this.boni[bonus.id] = bonus;
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






