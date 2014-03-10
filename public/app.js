
var keyFunctions = {
    37: "left",
    39: "right",
    38: "up",
    40: "down",
    27: "clear",
}

var players = {};
var screenMessages = [];


;
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
            $.each(cc, function(y, color) {
                if (x != null && y != null && color != null) {
                    App.line(x * world.pixelReso, y * world.pixelReso, x * world.pixelReso, y * world.pixelReso, color);
                }
            });
        }
    });

}

App.line = function(x1, y1, x2, y2, color) {
    App.ctx.beginPath();
    App.ctx.fillStyle = "solid";
    App.ctx.lineCap = "round";
    App.ctx.lineWidth = 6;
    App.ctx.strokeStyle = color;
    App.ctx.moveTo(x1, y1);
    App.ctx.lineTo(x2 + 0.01, y2 + 0.01);
    App.ctx.stroke();
}




function putmessage(textMess) {
    screenMessages.push({text: textMess.text, times: 100, color: textMess.color});
}
;



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
    App.ctx2.clearRect(0, 0, App.ctx2.canvas.width, App.ctx2.canvas.height);

    App.ctx2.font = "10px Arial";
    App.ctx2.fillStyle = "rgba(0, 0, 0, 0.5)";
    //show player neme		
    $.each(players, function(playerName, player) {
        App.ctx2.fillText(player.name + '(' + player.score + ')', player.x, player.y);
    });
    // show screen message


    $.each(screenMessages, function(num, mess) {
        alpha = (mess.times / 100);
        color = hexToRgb(mess.color);
        App.ctx2.fillStyle = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + alpha + ')';
        App.ctx2.font = "italic 20px Arial";
        App.ctx2.fillText(mess.text, 50, 50 + num * 50);
        mess.times *= 0.8;

        if (mess.times < 10) {
            screenMessages = _.without(screenMessages, mess);
        }
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
    socket = io.connect(document.URL),
            text = $('#text');

    socket.on('connect', function() {
        console.log("connected");
        text.html('connected');
    });

    socket.on('message', function(msg) {
        text.html(msg);
    });

    socket.on('disconnect', function() {
        console.log("disconnected");
        text.html('disconnected');
    });

    socket.on('caneva', function(world) {
        players = {};
        initCanvas(world);
    });

    socket.on('playerUpdate', function(player) {
        App.line(player.x, player.y, player.x, player.y, '#' + player.color);
        players[player.id] = player;
        refreshLayer();
    });

    socket.on('playerQuit', function(player) {
        delete players[player.id];
    });

    socket.on('showMessagesSreeen', function(textMess) {
        putmessage(textMess);
    });
}






function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}



function Vector(x, y) {
    this.x = x;
    this.y = y;
    this.add = function(vect) {
        return new Vector(this.x + vect.x, this.y + vect.y);
    };
    this.sub = function(vect) {
        return new Vector(this.x - vect.x, this.y - vect.y);
    };
    this.scalar = function(s) {
        return new Vector(this.x * s, this.y * s);
    }
    this.inv = function() {
        return new Vector(-this.x, -this.y);
    };

    this.angle = function() {
        return Math.atan2(this.y, this.x) * 180 / Math.PI;  //calcul angle
    };

}

function VectorMoy(vectors) {
    vect = new Vector(0, 0);
    for (i in vectors) {
        vect.add(vectors[i]);
    }
    vect.scalar(1 / vector.legth);
    return vect;
}
