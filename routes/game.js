const express = require('express');
const router = express.Router();
const io = require('../app.js').io;
const rooms = require('./home.js').rooms;
const pool = require('../app.js').pool;
router.use(express.static('../public'));
router.route('/:game')
.get((req,res)=>{
let game = rooms.find((room)=>{return (room.roomName == req.params.game)}); //get room if it exists
    if((game) && (game.AwaitingUsersIDs.find((userId)=>{return (userId == req.session.playerId)})))
        res.render('game',{ gameID: req.params.game,userID: req.session.playerId });
    else
       res.render('404');
});
io.on("connection",(socket)=>{
    socket.userId = socket.request.session.playerId;
    socket.on('ConnectToGame',(GAME_ID,USER_ID)=>{
        ConnectToGame(socket,GAME_ID);        
        socket.on('disconnect',() =>{
            let game = rooms.find((room)=>{return (room.roomName == GAME_ID) }); 
            if(!game) return;
            game.userSockets = game.userSockets.filter((player)=>{return (player.userId!=USER_ID)}); //remove old socket
        });
    });

});

function ConnectToGame(socket,gameID){
    let game = rooms.find((room)=>{return (room.roomName == gameID)}) 
    if(!(game.AwaitingUsersIDs.find((userId)=>{return (userId == socket.userId)}))) return; //think it can be removed
    if(game.userSockets.find((userId)=>{return (userId == socket.userId)})) return; //user already connected and him socket grabed in usersockets array
    pool.query(`select username from accounts where id = ${socket.userId};`,(err,res)=>{
        if (err||(res[0]) == undefined) return;
        socket.username = res[0].username;
        
        socket.join(game.roomName);
        game.userSockets.push(socket);
        
        PlayersReady = [];
        for(let i of game.userSockets){
            PlayersReady.push(i.username);
        }
        io.to(game.roomName).emit('PlayerReadyToStart',PlayersReady);
    })
}
module.exports = router;