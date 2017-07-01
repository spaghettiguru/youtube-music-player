const express = require('express');
const app = express();
const httpServer = require("http").Server(app);
const io = require('socket.io')(httpServer);

app.use(express.static("static"));

// app.get('/', function(req, res) {
//     res.sendFile(__dirname + '/index.html');
// });

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('add track', function(url) {
        console.log('A new track was added', url);
        io.emit('track added', url);
    });
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

httpServer.listen(3000, function() {
    console.log('listening on *:80');
});