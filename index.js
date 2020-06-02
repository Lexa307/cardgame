const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const argon2 = require('argon2');
const mysql = require('mysql');
const Room = require('./exports/Room.js');

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
	authUser(request,response);
});
app.post('/exit',(req,res)=>{
	req.session.destroy(() => {
		res.clearCookie('session_cookie_name', {path: '/home'});
		res.redirect('/');
	  });
});

app.post('/reg', function(request, response) {
	registerUser(request,response);
});

app.use((req,res,next) => {
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
		connection.query(`SELECT * from accounts where id = ${socket.userId} ;`,(err,res)=>{
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
				connection.query(`SELECT rank_name from ranks where rank_id = ${res[0].rank}`,(err,result)=>{
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
			rooms.push(new Room(io,connection,`room ${rooms.length+1}`,players[0],players[1]));			
			io.to(`room ${rooms.length}`).emit('gameFounded');//test

        }
       // console.reset();
        
	},100);
}

function registerUser(request,response){
	let nickname = request.body.nickname;
	let mail = request.body.mail;
	//to do: form validation on server side!
	let r = /[^A-Z-a-z-0-9]/;
	if(r.test(nickname)){
		response.json({message:" В никнейме должны быть только латинские буквы и цифры"});
		response.end();
		return;
	}
	if(r.test(request.body.password)){
		response.json({message:" В пароле введены недопустимые символы. Разрешены латинские буквы и цифры"});
		response.end();
		return;
	}
	connection.query(`SELECT * FROM accounts WHERE email = '${mail}';`,(err,results)=>{
		if (results.length > 0) {
			response.json({message:'Введенная почта уже зарегистрирована'});
			response.end();
			return;
		} else {
			connection.query(`SELECT * FROM accounts WHERE username = '${nickname}';`,(err,results)=>{
				if (results.length > 0) {
					response.json({message:'Этот никнейм уже используется'});
					response.end();
					return;
				} else {
						argon2.hash(request.body.password).then(hash =>{
							connection.query(`INSERT INTO accounts (username, password, email, gold,rank_points,matches, matches_win) VALUES ('${nickname}', '${hash}', '${mail}', '0','0','0','0');`,(err,results)=>{
								connection.query(`select id from accounts where email = '${mail}'`,(err,res)=>{
									let userid = res[0].id;
									//console.log(`user: ${userid}`);
									connection.query(`SELECT card_id from card where pack_id = 1`,
									(err,result)=>{
										//console.log(result)
										let cards = result;
										let queryStringInsertCards = `INSERT INTO deck(user_id, card_id, pos) values `;
										for(let i = 0 ; i < cards.length; i++ ){
											queryStringInsertCards+=`(${userid},${cards[i].card_id},${i}),`;
										}
										queryStringInsertCards = queryStringInsertCards.substr(0,queryStringInsertCards.length-1);
										queryStringInsertCards+=`;`;
										//console.log(queryStringInsertCards);

										connection.query(queryStringInsertCards,
											(err,result)=>{
												request.session.loggedin = true;
												request.session.mail = mail;
												request.session.nickname = nickname;
												request.session.gold = 0;
												request.session.playerId = userid;
												response.redirect('/home');
											});
									
									});
									
									

								});
								
							});
						});
				}
			}
		);}
	});
}
function authUser(request,response){
	var mail = request.body.mail;
	var password = request.body.password;
	let r = /[^A-Z-a-z-0-9]/;
	if(r.test(request.body.password)){
		response.json({message:" В пароле введены недопустимые символы. Разрешены латинские буквы и цифры"});
		response.end();
		return;
	}
	if (mail && password) {

			connection.query(`SELECT * FROM accounts WHERE email = '${mail}';` , (err,results)=> {
				if (results.length > 0) {
					try {
						argon2.verify(results[0].password, password).then(answer =>{
							if(answer){
								
								request.session.loggedin = true;
								request.session.mail = mail;
								request.session.nickname = results[0].username;
								request.session.gold = results[0].gold;
								request.session.playerId = results[0].id;
								response.redirect('/home');
							} else {
								// password did not match
								response.json({message:'Неправильный пользователь или пароль'});
								response.end();
							  }
						}); 
							
						 
					  } catch (error) {
						// internal failure
						response.json({message:'Ошибка сервера!'});
						response.end();
					  }

					
				} else {
					response.json({message:'Неправильный пользователь или пароль'});
					response.end();
				}			
			});
	
		
			} else {
		response.json({message:'Пожалуйста введите почту и пароль!'});
		response.end();
	}
}
searchingHandle();


http.listen(3000);