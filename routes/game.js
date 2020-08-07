const express = require('express');
const router = express.Router();
const io = require('../app.js').io;
const rooms = require('./home.js').rooms;
router.route('/game/:game')
.get((req,res)=>{
let game = rooms.find((room)=>{return (room.roomName == req.params.game)}); //get room if it exists
    if((game) && (game.AwaitingUsersIDs.find((userId)=>{return (userId == req.session.playerId)})))
        res.render('game',{ gameID: req.params.game });
    else
        res.render('404');
});
io.on("connection",(socket)=>{
    //how i can handle JWT from socket or req

    //session method 
    
});
module.exports = router;