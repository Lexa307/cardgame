var app = require('express')();
var express  =require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static('client'))
app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
    
  });
  io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('cardClick', function(msg){
        io.emit('rotate', msg);
      });
  });

  
http.listen(3000, function(){
  console.log('listening on *:3000');
});