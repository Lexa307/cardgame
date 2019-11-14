var app = require('express')();
var express  = require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const validate = require('validate.it.js');
app.use(express.static('client'))
app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
    
  });
  io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('cardClick', function(msg){
        io.emit('rotate', msg);
      });
      socket.on('register', function(msg){
        let f = validate(msg.password).hasLettersLatin().hasNumbers().longerThan( 6 ).lessThan( 16 )
        
        if(f.ok){
          console.log('ok');
        }else{
          for(let i = 0; i<f.errors.length;i++){
            f.errors[i].details.message = f.errors[i].details.message.replace(msg.password,"password");
          }
          io.emit('errors', f.errors);
          console.log(f.errors);
        }
        
      });

  });

  
http.listen(3000, function(){
  console.log('listening on *:3000');
});