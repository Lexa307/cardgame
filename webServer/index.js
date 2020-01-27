var app = require('express')();
var express  = require('express');
var http = require('http').createServer(app);
const validate = require('validate.it.js');
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs:60*1000,
  max:10
});
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
  app.post('/reg',function (request, response) { 
    if(request.headers["content-length"] > 1e6){
      response.writeHead(416,{'Content-type':'text/plain'});
      response.end();
      request.connection.destroy();
    }else{
      response.writeHead(200,"OK",{'Content-Type':'text/plain'});
      response.end();
    }
    
     console.log(request.body)
   
     
    
  });

  
http.listen(3000, function(){
  console.log('listening on *:3000');
});