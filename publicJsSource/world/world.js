
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
//            27: "clear",
            65: "activatePower",
            90: "activatePower2"
        },
        currentPlayerId = null,
        screenMessages  = [];


    this.world    = {},
    this.entities = {
        players    : {},
        boni       : {},
        missiles   : {},
        explosions : {},
        lasers     : {}
    };

    this.socket;
    $(document).ready(function() {

        that.initSocket();
        that.initKeyBinding();
        that.bindChangeName();

    });

    this.screenSize = {x: 800, y: 600};

    this.game = new Phaser.Game(this.screenSize.x, this.screenSize.y, Phaser.CANVAS, 'Tron', { create: createGame, update: _.noop, render: _.noop});

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
    this.initWorld = function() {

        var that = this;

        if(_.isUndefined(this.graphics)) {
            this.graphics = this.game.add.graphics(0, 0);
        }

        if(_.isUndefined(this.graphics2)) {
            this.graphics2 = this.game.add.graphics(0, 0);
        }

        //App.layer2.addEventListener("touchstart", doTouchStart, false);

        this.drawnBmp();

    };

    this.drawnBmp = function() {

        var that = this;

        this.graphics.clear();

        if (_.isUndefined(this.world.bmp)) {
            return this;
        }
/*
        $.each(this.world.bmp, function(x, cc) {
            if (cc != null) {
                $.each(cc, function(y, pixel) {
                    if (
                        x != null && y != null && pixel != null &&
                        that.offsetX + x * that.world.pixelReso > 0 &&
                        that.offsetX + x * that.world.pixelReso < that.screenSize.x &&
                        that.offsetY + y * that.world.pixelReso > 0 &&
                        that.offsetY + y * that.world.pixelReso < that.screenSize.y
                    ) {
                        that.graphics.beginFill(getIntColor(pixel.color), pixel.color.a);
                        that.graphics.drawCircle(that.offsetX + x * that.world.pixelReso, that.offsetY + y * that.world.pixelReso, that.world.pixelReso);
                    }
                });
            }
        });
*/

        for (var x = -2; x < (this.screenSize.x) / this.world.pixelReso ; x++) {
            for (var y = -2; y < this.screenSize.y / this.world.pixelReso + 2; y++) {
                var isInWorld  = x >= 0 && x <= (that.world.width / this.world.pixelReso) && y >= 0 && y <= (that.world.height / this.world.pixelReso),
                    pixel      = isInWorld && !_.isUndefined(that.world.bmp[x]) && !_.isNull(that.world.bmp[x]) && !_.isUndefined(that.world.bmp[x][y]) ? that.world.bmp[x][y] : null,
                    pixelX     = that.offsetX + x * that.world.pixelReso,
                    pixelY     = that.offsetY + y * that.world.pixelReso
                    isInScreen = pixelX > 0 &&
                                 pixelX < that.screenSize.x &&
                                 pixelY > 0 &&
                                 pixelY < that.screenSize.y;
//                if (isInScreen) {
                    if (pixel != null) {

                        that.graphics.beginFill(getIntColor(pixel.color), pixel.color.a);
                        that.graphics.drawCircle(that.offsetX + x * that.world.pixelReso, that.offsetY + y * that.world.pixelReso, that.world.pixelReso);
                    }
                    if (!isInWorld) {
                        that.graphics.beginFill(getIntColor({r:255,g:0,b:0}), 128);
                        that.graphics.drawCircle(that.offsetX + x * that.world.pixelReso, that.offsetY + y * that.world.pixelReso, that.world.pixelReso);

                    }

//                }
            }
        }

    };

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
            $powerbarvalue = $('#power-bar .power-value'),
            currentPlayer  = this.entities.players[currentPlayerId],
            power          = !_.isUndefined(currentPlayer) ? currentPlayer.powerCharge / currentPlayer.powerMax * 100 : 0,
            currentPlayerX = currentPlayer.x * this.world.pixelReso,
            currentPlayerY = currentPlayer.y * this.world.pixelReso;

        this.offsetX        = this.screenSize.x / 2 - currentPlayerX;
        this.offsetY        = this.screenSize.y / 2 - currentPlayerY;

        this.graphics2.clear();
        this.graphics2.removeChildren();


        $.each(this.entities.players, function(playerName, player) {
            var playerX = that.offsetX + player.x * that.world.pixelReso,
                playerY = that.offsetY + player.y * that.world.pixelReso;

            //show player neme
            that.graphics2.addChild(that.game.add.text(playerX, playerY, player.name + '(' + player.x + ',' + player.y + ')', {font: "10px Arial", fill: "#ffffff"}));

            //add new positions of players

            if(_.isUndefined(that.world.bmp[player.x]) || _.isNull(that.world.bmp[player.x])) {that.world.bmp[player.x] = [];}
            that.world.bmp[player.x][player.y] = player;
//            that.graphics.beginFill(getIntColor(player.color), player.color.a);
//            that.graphics.drawCircle(playerX, playerY, that.world.pixelReso);

        });

        this.drawnBmp();


        //Show powerState
        if (!_.isUndefined(currentPlayer)) {
            $powerbarvalue.css('width', (power) + '%');

            $powerbarvalue.removeClass('half');
            $powerbarvalue.removeClass('full');

            if (power >= 50) {
                $powerbarvalue.addClass('half');
            }

            if (power >= 100) {
                $powerbarvalue.addClass('full');
            }

//            that.graphics2.addChild(that.game.add.text(0, 580, Math.round(currentPlayer.powerCharge / currentPlayer.powerMax*100),   {font: "italic 20px Arial", fill: "#ffffff"}));
            that.graphics2.addChild(that.game.add.text(0, 550, currentPlayer.score,   {font: "italic 20px Arial", fill: "#ffffff"}));
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
        _.each(this.entities.boni, function(bonus){
            that.graphics2.beginFill(getIntColor(bonus.color), 1);
            that.graphics2.drawCircle(that.offsetX + bonus.x * that.world.pixelReso, that.offsetY + bonus.y * that.world.pixelReso, that.world.pixelReso);
        });


       //Show missiles
        _.each(this.entities.missiles, function(missile){
            that.graphics2.beginFill(getIntColor(missile.color), 1);
            that.graphics2.drawCircle(that.offsetX + missile.x * that.world.pixelReso, that.offsetY + missile.y * that.world.pixelReso, that.world.pixelReso);
        });

        //Show explosions
        _.each(this.entities.explosions, function(explosion){
            that.graphics2.beginFill(getIntColor(explosion.color), explosion.color.a);
            that.graphics2.drawCircle(that.offsetX + explosion.x * that.world.pixelReso, that.offsetY + explosion.y * that.world.pixelReso, that.world.pixelReso * explosion.step/2);
        });

        //Show lasers
        _.each(this.entities.lasers, function(laser){
            that.graphics2.beginFill(getIntColor(laser.color), laser.color.a);
            var y = laser.y,
                x = laser.x;

            while
                ( x < that.world.width &&
                  x > 0 &&
                  y < that.world.height &&
                  y > 0
                ) {
                switch (laser.direction) {
                    case "right":
                        x++;
                        break;
                    case "left":
                        x--;
                        break;
                    case "up":
                        y--;
                        break;
                    case "down":
                        y++;
                        break;
                }
                that.graphics2.drawCircle(that.offsetX + x * that.world.pixelReso, that.offsetY + y * that.world.pixelReso, that.world.pixelReso * laser.step/4);
           }
        });

    }

    this.bindChangeName = function() {

        var that = this;

        $('.sendValue').bind('submit', function(e) {
            return false;
        });

        $('.sendValue').bind('click', function(e) {
            $form = $(e.currentTarget).closest('form');
            that.socket.emit("sendValue", $form.serializeArray());
            console.log("sendValue", $form.serializeArray());
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
            that.world = worldObj;
            that.initWorld();
        });

        this.socket.on('updateBmpPixels', function(pixels) {
            _.each(pixels, function(pixel){
                if (_.isNull(pixel.content)) {
                    if(!_.isUndefined(that.world.bmp[pixel.x])) delete that.world.bmp[pixel.x][pixel.y];
                    return;
                };
                if(_.isUndefined(that.world.bmp[pixel.x])) {that.world.bmp[pixel.x] = [];}
                that.world.bmp[pixel.x][pixel.y] = pixel.content;
            });
            that.drawnBmp();

        });

        //Update all players
        this.socket.on('entitiesUpdate', function(entities) {
            that.entities = entities;

            //refresh graphics layer
            that.refreshLayer();
        });

        //On opponnet quit
        this.socket.on('playerQuit', function(player) {
            delete that.entities.players[player.id];
        });

        //Show message on screen
        this.socket.on('showMessagesSreeen', function(textMess) {
            putmessage(textMess);
        });
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






