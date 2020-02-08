var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const argon2 = require('argon2');
const saltRounds = 8;
const rateLimit = require('express-rate-limit');
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
app.use(express.static('client'))
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
						}) 
							
						 
					  } catch (err) {
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
    console.log(path.join(__dirname + '/client/home/home.html'))
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
								})
						});

						

					  

				}
			
			}
		)}
	})
});



io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
});

http.listen(3000);
