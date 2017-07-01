"use strict";

const express = require('express');
const app = express();
const httpServer = require("http").Server(app);
const io = require('socket.io')(httpServer);

let users = [];
let trackList = [];

app.use(express.static("static"));

io.on('connection', function(socket) {
    let userName = socket.handshake.query.userName;
    users.push(userName);

    console.log('User <' + userName + '> connected');

    socket.emit('track list', trackList);

    socket.on('add track', function(data) {
        io.emit('track added', data);
        trackList.push(data);
        console.log('A new track was added', data);
    });

    socket.on('disconnect', function(reason) {
        let userIndex = users.indexOf(userName);
        if (userIndex >= 0) {
            users.splice(userIndex, 1);
        }

        console.log('User <' + userName + '> disconnected');
    });
});

httpServer.listen(3000, function() {
    console.log('listening on *:80');
});