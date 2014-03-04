var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');
var _= require('underscore');
var Player = require('./Player');
app.listen(8181);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
	console.log(req.url);
    res.writeHead(200);
    res.end(data);
  });
}





var world = require('./World');
var players = {};



io.configure('production', function(){
  io.set('log level', 1);
});

io.sockets.on('connection', function (socket) {
	socket.heartbeatTimeout = 5000;
	var player = new Player();
	
  socket.emit('caneva',  world );
  player.spawn();
  socket.on('keyup', function (data) {
	if(data.keyFunction!=''){
		
		if (player.direction!="dead"){
			if (_.contains(player.directionlist, data.keyFunction)){
				if (
						(
							(data.keyFunction=="left" || data.keyFunction=="right") &&
							(player.direction=="up" || player.direction=="down") 
						)
						||
						(
							(data.keyFunction=="up" || data.keyFunction=="down") &&
							(player.direction=="left" || player.direction=="right")
						)							
					){
						player.direction=data.keyFunction;
					sendMessage(data.keyFunction);
					}
				return;
			}
			
		}
		if (data.keyFunction=="clear"){
			console.log("clear Bmp");
			world.bmp = [];
			io.sockets.emit('caneva',  world );
		}
	}
	
  });
  
  socket.on('disconnect', function() {
      console.log('Got disconnect!');
	  io.sockets.emit('playerQuit',  player );      
	  players = _.without(players,player);
	  player=false;
   });
    
	socket.on('sendValue', function(data) {
		 console.log('sendValue!',data);
		 _.each(data,function(data){
			if(data.name='nickname'){	
				oldplayerName = player.name;
				io.sockets.emit('playerQuit',  player );      
				
				player.name=data.value;
				
				players[player.name]=player;
				io.sockets.emit('playerUpdate',  player );				
				delete players[oldplayerName];
				
			}
		 });
		 
	  });
   
  
  function sendMessage(message){
	socket.emit('message',message);
}


playerRoutine();

function playerRoutine(){
	if(player==false) return;
	switch(player.direction){		
		case "right": player.x+=player.speed;break;
		case "left": player.x-=player.speed;break;
		case "up": player.y-=player.speed;break;
		case "down": player.y+=player.speed;break;
	}
	
	if(world.bmp[player.x/world.pixelReso]==undefined){
		world.bmp[player.x/world.pixelReso] = [];
	}
	if (player.direction!="dead")
	if (
			player.x < 0 || player.x > world.width ||
			player.y < 0 || player.y > world.height ||
			world.bmp[player.x/world.pixelReso][player.y/world.pixelReso]!=null			
		){
		player.kill();
		io.sockets.emit('showMessagesSreeen',{text:player.name + ' ☹' , color:player.color});
		sendMessage("you are dead");
	}
	
	world.bmp[player.x/world.pixelReso][player.y/world.pixelReso]=player.color;

	
	setTimeout (playerRoutine,50);
	
	if(_.contains(player.directionlist,player.direction)){	
		players[player.name]=player;
		io.sockets.emit('playerUpdate',  player );
	}
	
}
  
});


function clearWorld(){
	world.bmp = [];
	io.sockets.emit('caneva',  world );
	_.each(players,function (p){
		p.spawn();
	});
}

serverRoutine();

function serverRoutine(){
	var lastplayer=null;
	countplayernotdead=0;
	_.each(players,function (p){	//todo _.find
		if(p.direction!="dead"){
				lastplayer=p;
				countplayernotdead++;	
		}
	});
	if(countplayernotdead <= 1){
		clearWorld();
		if(_.size(players)>1 && lastplayer!=null){
			lastplayer.score++;
		}else{
			
		}
	}
		
	
	
	
	setTimeout (serverRoutine,50);
};

/*

idee match scoring avec bot // necessice un lobby
			t = temps propre de survi;
			n = nombre de joueurs;
			T = temps de mort du BOT sinon 0
			B = 10 ;bonnus de temps de survi pour vaincu le BOT
			
			score = t + T * B/n
			
*/

