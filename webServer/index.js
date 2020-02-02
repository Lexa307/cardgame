var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const bcypt = require('bcrypt');
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
					console.log(results[0].password);
					bcypt.compare(password,results[0].password,(err,result)=>{
						if(result){
							request.session.loggedin = true;
							request.session.mail = mail;
							response.redirect('/home');
						} else {
							response.send('Incorrect Username and/or Password!');
						}	
					})
					
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
					bcypt.genSalt(saltRounds,(err,salt)=>{
						bcypt.hash(request.body.password,salt,(err,hash)=>{
							console.log(hash);
							connection.query(`INSERT INTO accounts (username, password, email) VALUES ('${nickname}', '${hash}', '${mail}');`,(err,results)=>{
								
								request.session.loggedin = true;
								request.session.mail = mail;
								response.redirect('/home');
							})
						})
					})
				}
			
			}
		)}
	})
});

app.listen(3000);
