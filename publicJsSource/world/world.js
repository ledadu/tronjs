

//TODO PUT THIS in a OBJET!!!



var keyFunctions = {
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
    boni            = {},
    currentPlayerId = null,
    screenMessages  = [];



var socket;
$(document).ready(function() {

    initSocket();
    initKeyBinding();
    bindChangeName();

});


var App = {};

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

function initCanvas(world) {
    App.layer1 = document.createElement('canvas'); //#create the canvas element
    App.layer1.width = world.width;
    App.layer1.height = world.height;
    App.layer1.style.zIndex = 0;

    App.layer2 = document.createElement('canvas'); //#create the canvas element
    App.layer2.width = world.width;
    App.layer2.height = world.height;
    App.layer2.style.zIndex = 1;

    App.layer2.addEventListener("touchstart", doTouchStart, false);

    $("#cnv").width(world.width).height(world.height);
    $("#cnv").html(App.layer1); //#append it into the DOM
    $("#cnv").append(App.layer2); //#append it into the DOM

    App.ctx = App.layer1.getContext("2d");
    App.ctx2 = App.layer2.getContext("2d");

    $.each(world.bmp, function(x, cc) {
        if (cc != null) {
            $.each(cc, function(y, pixel) {
                if (x != null && y != null && pixel != null) {
                    App.line(x * world.pixelReso, y * world.pixelReso, x * world.pixelReso, y * world.pixelReso, pixel.color);
                }
            });
        }
    });

}
//TODO make point function
App.line = function(x1, y1, x2, y2, color) {
    App.ctx.beginPath();
    App.ctx.fillStyle = "solid";
    App.ctx.lineCap = "round";
    App.ctx.lineWidth = world.pixelReso + 1;
    App.ctx.strokeStyle = color;
    App.ctx.moveTo(x1, y1);
    App.ctx.lineTo(x2 + 0.01, y2 + 0.01);
    App.ctx.stroke();
}

function putmessage(textMess) {
    screenMessages.push({text: textMess.text, times: 1000, color: textMess.color});
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

    var currentPlayer = players[currentPlayerId];

    //clear screen
    App.ctx2.clearRect(0, 0, App.ctx2.canvas.width, App.ctx2.canvas.height);

    App.ctx2.font = "10px Arial";
    App.ctx2.fillStyle = "rgba(0, 0, 0, 0.5)";
    //show player neme
    $.each(players, function(playerName, player) {
        App.ctx2.fillText(player.name + '(' + player.score + ')', player.x * world.pixelReso, player.y * world.pixelReso);
    });

    //Show powerState
    if (!_.isUndefined(currentPlayer)) {
        App.ctx2.fillStyle = 'rgb(0,0,0)';
        App.ctx2.font = "italic 20px Arial";
        App.ctx2.fillText(Math.round(currentPlayer.powerStep / currentPlayer.powerCharge*100), 50, 100); //in percent
    }
    // show screen message
    $.each(screenMessages, function(num, mess) {
        alpha = (mess.times / 1000);
        color = mess.color;
        App.ctx2.fillStyle = writeRgbStyle(color, alpha);
        App.ctx2.font = "italic 20px Arial";
        App.ctx2.fillText(mess.text, 50, 50 + num * 50);
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

        App.line(bonus.x * world.pixelReso, bonus.y * world.pixelReso, bonus.x * world.pixelReso, bonus.y * world.pixelReso, writeRgbStyle(color));
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

function initSocket() {

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
    socket.on('caneva', function(worldObj) {
        world = worldObj;
	players = {};
        initCanvas(world);
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
    socket.on('boniUpdate', function(boni) {
        this
        _.each(boni, function(bonus){
            bonusUpdate(bonus);
        });
        refreshLayer();
    });

    //Show message on screen
    socket.on('showMessagesSreeen', function(textMess) {
        putmessage(textMess);
    });
}

function playerUpdate(player) {
    var darkenColor = darken(player.color, 0.3);
    if (player.class == 'digger'){
        if (player.activatePower) {
            App.line(player.x * world.pixelReso, player.y * world.pixelReso, player.x * world.pixelReso, player.y * world.pixelReso, writeRgbStyle(player.color, 0.15));
        } else {
            App.line(player.x * world.pixelReso, player.y * world.pixelReso, player.x * world.pixelReso, player.y * world.pixelReso, writeRgbStyle(player.color));
        }
    }

    if (player.class == 'speeder'){
        if (player.activatePower || player.activatePower2) {
            App.line(player.x * world.pixelReso, player.y * world.pixelReso, player.x * world.pixelReso, player.y * world.pixelReso, 'rgb(' + darkenColor.r + ', ' + darkenColor.g + ', ' + darkenColor.b + ')');
        } else {
            App.line(player.x * world.pixelReso, player.y * world.pixelReso, player.x * world.pixelReso, player.y * world.pixelReso, writeRgbStyle(player.color));
        }

    }

    if (_.isNull(player.class)){
        App.line(player.x * world.pixelReso, player.y * world.pixelReso, player.x * world.pixelReso, player.y * world.pixelReso, writeRgbStyle(player.color));
    }

    players[player.id] = player;
};

function bonusUpdate(bonus) {
    boni[bonus.id] = bonus;
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







