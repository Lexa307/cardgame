const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const argon2 = require('argon2');
const mysql = require('mysql');

var options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1234',
    database: 'carddb'
};

const connection = mysql.createConnection(options);
var MySQLStore = require('express-mysql-session')(session);

 
var sessionStore = new MySQLStore({
    expiration: 10800000,
    createDatabaseTable: true,
    schema: {
        tableName: 'USERS_SESSIONS',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, connection);
app.use(cookieParser());
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const searching =  [];
const rooms = [];
var sessionMiddleware = session({
	key: 'session_cookie_name',
	secret: 'secret',
	resave: false,
	store: sessionStore,
    saveUninitialized: true,
   
});
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.use(express.static('./public/'));
app.use(require('./routes'));



app.get('/', function(request, response) {
	response.redirect(`/auth`);
});

app.post('/auth',function(request,response){
    var mail = request.body.mail;
	var password = request.body.password;
	if (mail && password) {

			connection.query(`SELECT password FROM accounts WHERE email = '${mail}';` , (err,results)=> {
				if (results.length > 0) {
					try {
						argon2.verify(results[0].password, password).then(answer =>{
							if(answer){
								
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
							connection.query(`INSERT INTO accounts (username, password, email, gold,rank_points,matches, matches_win) VALUES ('${nickname}', '${hash}', '${mail}', '0','0','0','0');`,(err,results)=>{
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

app.use((req,res,next) => {
    res.status(404).sendFile(path.join(__dirname + '/public/404.html'));
});



io.on('connection', function(socket){
	console.log('a user connected');
	socket.searching = false;
	console.log(socket.request.session);
	// var cookie_string = socket.request.headers.cookie;
	// if( cookieParser.JSONCookies(cookie_string).indexOf('session_cookie_name=s%3A')!=-1){
	// 	let connect_sid = cookieParser.JSONCookies(cookie_string).split(';')[1].replace('session_cookie_name=s%3A','').split('.')[0].replace(' ','');
	// 	console.log(connect_sid.length);
	// 	sessionStore.get(connect_sid, function (error, session) {
			

	// 		if(session){
	// 			session.mail
	// 		}
			
	// 	  });
  
	// }


		
    socket.on('disconnect', function(){
		if (socket.searching){
			let pos = -1;
			for(let i = 0 ; i<searching.length-1; i++){
				if(searching[i].id == socket.id){
					pos = i;
					break;
				}
			}
			searching.splice(pos,1);
			socket.searching = false;
		}
      console.log('user disconnected');
	});
	socket.on('searching', function(msg){
		socket.searching = true;
        searching.push(socket);
        console.log(searching);
		
	});
});
console.reset = function () {
    return process.stdout.write('\033c');
  };
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
       // console.reset();
        
	},100);
}
searchingHandle();


http.listen(3000);