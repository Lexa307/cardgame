const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const argon2 = require('argon2');
const mysql = require('mysql');
const Room = require('./exports/Room.js');
require('dotenv').config();
var options = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	connectionLimit:process.env.DB_CONNECTION_LIMIT
};
const pool = mysql.createPool(options);
var MySQLStore = require('express-mysql-session')(session);
module.exports = pool;
 
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
}, pool);
app.use(cookieParser());
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const searching =  [];
const rooms = [];
var sessionMiddleware = session({
	key: 'session_cookie_name',
	secret: process.env.SECRET_KEY,
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
app.use(express.json());
app.use(require('./routes/index.js'));
app.get('/', function(request, response) {
	response.redirect(`/auth`);
});

app.post('/exit',(req,res)=>{
	req.session.destroy(() => {
		res.clearCookie('session_cookie_name', {path: '/home'});
		res.redirect('/');
	  });
});
app.use((req,res,next) => {
    console.log(path.join(__dirname + '/public/404.html'));
    res.status(404).sendFile(path.join(__dirname + '/public/404.html'));
});

function cancelSearching(socket){
	if (socket.searching){ //если пользователь внезапно закроет вкладку при поиске
		let pos = -1;
		for(let i = 0 ; i < searching.length; i++){
			if(searching[i].id == socket.id){
				pos = i;
				break;
			}
		}
		searching.splice(pos,1);
		socket.searching = false;
	}
}

function endGame(socket){
	if(socket.inGame){

		for(let i = 0; i < rooms.length; i++){
			if(rooms[i].roomName == Object.keys(socket.adapter.rooms)[1]){
				rooms[i].endGame(socket);
				console.log(rooms.length);
				rooms.splice(i,1);
				console.log(rooms.length);
			}
		}
	}
}

io.on('connection', (socket)=>{
	console.log('a user connected');
	socket.searching = false;
	// console.log(socket.request.session);
	socket.userId = socket.request.session.playerId;
		
    socket.on('disconnect', ()=>{
		cancelSearching(socket);
		endGame(socket);

      console.log('user disconnected');
	});

	socket.on("getAccData",()=>{
		pool.query(`SELECT * from accounts where id = ${socket.userId} ;`,(err,res)=>{
			if(res[0].rank == null){
				io.to(socket.id).emit("accData",
				{
					nickname:socket.request.session.nickname,
					gold:res[0].gold,
					win:res[0].matches_win,
					rank:"Не откалиброван",
					battles:res[0].matches
				});
			}else{
				pool.query(`SELECT rank_name from ranks where rank_id = ${res[0].rank}`,(err,result)=>{
					console.log(res);
					io.to(socket.id).emit("accData",
					{
						nickname:socket.request.session.nickname,
						gold:res[0].gold,
						win:res[0].matches_win,
						rank:result[0].rank_name,
						battles:res[0].matches
					});				
				});
			}
		});
	});

	socket.on('cancelSearch',()=>{
		cancelSearching(socket);
	});

	

	socket.on('searching', function(msg){
		if(socket.inGame||socket.searching){return;}
		for(let i = 0; i<searching.length; i++){
			if(searching.userId == socket.userId){return;}
		}
		socket.searching = true;
        searching.push(socket);
	});
});

function searchingHandle(){
	let timerId = setInterval(()=>{
		if(searching.length >= 2){
			let players = searching.splice(0,2);
			rooms.push(new Room(io,pool,`room ${rooms.length+1}`,players[0],players[1]));			
			io.to(`room ${rooms.length}`).emit('gameFounded');//test

        }
       // console.reset();
        
	},100);
}

searchingHandle();


http.listen(3000);