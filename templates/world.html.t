<html>
    <head>
        <script src="/socket.io/socket.io.js"></script>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
        <script src="http://underscorejs.org/underscore-min.js"></script>
         <script src="/vendor/phaser.min.js"></script>
        <link rel="stylesheet" type="text/css" href="/styles.css">
        <script>
            var worldId = {{worldId}};
        </script>

        <script src="/world.js"></script>
    </head>
    <body>
        <div id="text"></div>
        <div id="id_user">id_user : {{id_user}}</div>
        <form class="sendValue">
            Name <input name="nickname" value="{{name}}"/> <button >Change name</button>
        </form>
        <form class="sendValue">
            Pixel <input name="pixelReso" value="{{pixelReso}}"/> <button >Change pixel resolution</button>
        </form>
        <div id="power-bar">
            <div class="power-value" style="width:0%"></div>
        </div>
        <div id="cnv" style="position: relative;"></div>
    </body>
</html>
