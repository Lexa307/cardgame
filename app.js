const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const mysql = require('mysql');
require('dotenv').config();
app.use(express.static('./public/'));
app.set('view engine', 'ejs');

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
module.exports = {pool:pool,io:io};
app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(express.json());
app.use(require('./routes/index.js'));
app.get('/', function(request, response) {
	response.redirect(`/auth`);
});


app.use((req,res,next) => {
    res.render('404');
});



// function searchingHandle(){
// 	let timerId = setInterval(()=>{
// 		if(searching.length >= 2){
// 			let players = searching.splice(0,2);
// 			rooms.push(new Room(io,pool,`room ${rooms.length+1}`,players[0],players[1]));			
// 			io.to(`room ${rooms.length}`).emit('gameFounded');//test
//         }
//        // console.reset();
        
// 	},100);
// }


// searchingHandle();


http.listen(process.env.PORT);

