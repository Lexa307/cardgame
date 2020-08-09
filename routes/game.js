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
        res.render('game',{ gameID: req.params.game });
    else
       res.render('404');
});
io.on("connection",(socket)=>{
    socket.userId = socket.request.session.playerId;
    socket.on('ConnectToGame',(msg)=>{
        ConnectToGame(socket,msg);        
       // console.log(socket.id + "connects to "+msg);
    });
    socket.on('disconnecting',socket =>{
        // console.time('find');
        let game = rooms.find((room)=>{return (room.userSockets.find((user)=>{return (user.userId == socket.userId)}))}); 
        // console.timeLog('find');
        // console.log(Object.keys(socket.rooms))
        if(!game) return;
        console.log(game.userSockets);
        game.userSockets = game.userSockets.filter((player)=>{return (player.userId!=socket.userId)});
        // console.timeLog('find');
        // console.timeEnd('find');
    })
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
        console.table(PlayersReady);
        io.to(game.roomName).emit('PlayerReadyToStart',PlayersReady);
    })
}
module.exports = router;