<html>
    <head>
        <script src="/socket.io/socket.io.js"></script>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
        <script src="http://underscorejs.org/underscore-min.js"></script>
         <script src="/phaser.min.js"></script>
        <link rel="stylesheet" type="text/css" href="/styles.css">
        <script>
            var worldId = {{worldId}};
        </script>

        <script src="/world.js"></script>  
    </head>
    <body>
        <div id="text"></div>
        <div id="id_user">id_user : {{id_user}}</div>
        <div id="cnv" style="border:solid 1px #eeeeee;position: relative;"></div>
        <form class="sendValue">
            name <input name="nickname" value="{{name}}"/> <button >Change name</button>
        </form>
    </body>
</html>
