var app = require('express')();
var express  = require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const validate = require('validate.it.js');
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs:60*1000,
  max:10
});
let lobby = [];
let rotationState = {x:0,y:0,z:0}
// class Lobby {
//   constructor(player1,player2){
//     this.player1 = player1;//socket pl1
//     this.player2 = player2;//socket pl2
//     this.testcardRotation = {x:0,y:0,z:0}
//   }
//   disconnectPlayers(){
//     this.player1.
//   }
// }

//var cookieParser = require('cookie-parser')
// var mysql = require('mysql');
// var con = mysql.createConnection({
//   host: "localhost",
//   port: "3306",
//   user: "root",
//   password: "1234"
// });
// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });
// con.query(`use carddb;`, function (err, result) {
//   if (err) throw err;
//   console.log("Result: " + result);
// });
app.use(express.static('client'))
app.use(express.json());
app.use(limiter);
//app.use(cookieParser())
app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
  
  });

  io.on('connection', function(socket){
    
    socket.on('join', function(msg){
    
      if(lobby.length<4){
        
        lobby.push(msg)
        let pos = lobby.length-1;
        console.log(`pos of ${msg} : ${pos}`);
        io.emit("respond",{msg:"ok", status:"connected",data:rotationState});
        console.log(lobby);
        console.log(`${msg} has been connected` );
        socket.on('disconnect', function(){
          lobby.splice(pos,1)
          console.log(lobby);
          console.log(`${msg} has been disconnected`);
        });
        socket.on('cardClick', function(msg){
          rotationState.y+=1;
          io.emit("rotate",1);
        });
        
      } else{
        io.emit("respond",{msg:"not enouth space in lobby", status:"dropped",data:null});
      }   
    });
  
    
  });


  // app.post('/reg',function (request, response) { 
  //   if(request.headers["content-length"] > 1e6){
  //     response.writeHead(416,{'Content-type':'text/plain'});
  //     response.end();
  //     request.connection.destroy();
  //   }else{
  //     response.writeHead(200,"OK",{'Content-Type':'text/plain'});
  //     response.end();
  //   }
    
  //    console.log(request.body)
   
     
    
  // });

  
http.listen(3000, function(){
  console.log('listening on *:3000');
});