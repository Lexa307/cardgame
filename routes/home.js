const express = require('express');
const searching = [];
const rooms = [];
const Room = require('../exports/Room.js');
const {pool,io} = require('../app.js');
const router = express.Router();
router.route('/home') 
.get((request, response) => {
	if(request.session.loggedin == undefined){
		response.redirect('/auth');
	}else{
        response.render('home', { userID: request.session.playerId });
         
        io.on('connection', (socket)=>{
            console.log('a user connected');
            socket.userId = socket.request.session.playerId;
            
            socket.on("getAccData",()=>{
                pool.query(`SELECT username,gold,matches_win,matches,(select rank_name from ranks where rank_id = rank) as rank_name from accounts where id = ${socket.userId} ;`,(err,res)=>{
                    io.to(socket.id).emit("accData",
                    {
                        nickname:res[0].username,
                        gold:res[0].gold,
                        win:res[0].matches_win,
                        rank:res[0].rank_name,
                        battles:res[0].matches
                    });
                });
            });

            socket.on('disconnect', ()=>{
                cancelSearching(socket);
                console.log('user disconnected');
            });
        
            socket.on('cancelSearch',()=>{
                cancelSearching(socket);
            });
        
            socket.on('searching', function(msg){
                AddUserToSearchQueue(socket);
            });
        });
            
    }
});
function cancelSearching(socket){
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



function AddUserToSearchQueue(socket){
    if(!socket.request.session.loggedin) return; //chech user if he not in system
    if(searching.find(user => {user.request.session.playerId == socket.request.session.playerId})) return; //user already in queue
	searching.push(socket);
	if(searching.length >= 2) StartGameSequrnce( searching.splice(0,2) );
}
function StartGameSequrnce(users){ //as socket
    let NewGameRoom = uuidV4();
    for(let i = 0; i < users.length; i++){
        users[i].request.session.inGame = NewGameRoom;
        io.to(users[i].id).emit('redirect','/game' + NewGameRoom);
    }
}


module.exports = router;