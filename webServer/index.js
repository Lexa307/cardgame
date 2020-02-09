var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const argon2 = require('argon2');
const rooms = [];
const rateLimit = require('express-rate-limit');
const searching =  [];
const limiter = rateLimit({
  windowMs:60*1000,
  max:10
});
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '1234',
	database : 'carddb'
});

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static('client'));
app.use(limiter);
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/client/login.html'));
});

app.post('/auth', function(request, response) {
	var mail = request.body.mail;
	var password = request.body.password;
	if (mail && password) {

			connection.query(`SELECT password FROM accounts WHERE email = '${mail}';` , (err,results)=> {
				if (results.length > 0) {
					try {
						argon2.verify(results[0].password, password).then(answer =>{
							if(answer){
								console.log(answer);
								request.session.loggedin = true;
								request.session.mail = mail;
								response.redirect('/home');
							} else {
								// password did not match
								response.send('Incorrect Username and/or Password!');
							  }
						}); 
							
						 
					  } catch (error) {
						// internal failure
						response.send('server error!');
					  }

					
				} else {
					response.send('Incorrect Username and/or Password!');
				}			
			});
	
		
			} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
    //response.send('Welcome back, ' + request.session.username + '!');
    //response.sendFile(path.join(__dirname + '/client/home/home.html'));
    console.log(path.join(__dirname + '/client/home/home.html'));
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.post('/reg', function(request, response) {
	var nickname = request.body.nickname;
	var mail = request.body.mail;
	connection.query(`SELECT * FROM accounts WHERE email = '${mail}';`,(err,results)=>{
		if (results.length > 0) {
			response.send('This user alreafy exist');
			response.end();
		} else {
			connection.query(`SELECT * FROM accounts WHERE username = '${nickname}';`,(err,results)=>{
				if (results.length > 0) {
					response.send('This nickname already used');
					response.end();
				} else {

					
						argon2.hash(request.body.password).then(hash =>{
							connection.query(`INSERT INTO accounts (username, password, email) VALUES ('${nickname}', '${hash}', '${mail}');`,(err,results)=>{
								request.session.loggedin = true;
								request.session.mail = mail;
								response.redirect('/home');
								});
						});

						

					  

				}
			
			}
		);}
	});
});



io.on('connection', function(socket){
	console.log('a user connected');
	socket.searching = false;
    socket.on('disconnect', function(){
		if (socket.searching){
			let pos = -1;
			for(let i = 0 ; i<searching.length-1; i++){
				if(searching[i].id == socket.id){
					pos = i;
					break;
				}
			}
			searching.splice(i,1);
			socket.searching = false;
		}
      console.log('user disconnected');
	});
	socket.on('searching', function(msg){
		socket.searching = true;
		searching.push(socket);
		
		console.log(this);
	});
});
function searchingHandle(){
	let timerId = setInterval(()=>{
		if(searching.length >= 2){
			let players = searching.splice(0,2);
			rooms.push({name:`room ${rooms.length+1}`});
			for(let i = 0; i < players.length; i++){
				rooms[rooms.length-1][`id${i}`] = players[i].id;
				players[i].join(`room ${rooms.length}`);
				players[i].searching = false;
			}
			io.to(`room ${rooms.length}`).emit('startGame');

		}
	},100);
}
searchingHandle();


http.listen(3000);
