function bind(func, context) {
	return function() {
	  return func.apply(context, arguments);
	};
}
const pool = require('../app.js').pool;
const io = require('../app.js').io;
class Room{
    constructor(roomName,users){
        this.roomName = roomName;
        this.AwaitingUsersIDs = [];
        for(let i of users){
            this.AwaitingUsersIDs.push(i.userId);
        }    
        this.userSockets = [];
        this.stages = {
            "AwaitingPlayersToStart":true,
            "AwaitingPlayersLoadRes":false,
            "AwaitingPlayersPickSleeve":false,
            "PlayersFighting":false,
            "EndGame":false,
        }
        this.gold1 = this.gold2 = 10;
        this.timer = null; 

        //Карты в колоде у игроков
        this.colodCards1 = [];
        this.colodCards2 = [];
        //Карты в рукаве у игроков
        this.sleeveCards1 = [];
        this.sleeveCards2 = [];
        //Карты на поле боя
        this.fieldCards1 = [];
        this.fieldCards2 = [];
        this.round = 0;
        // this.users[0].join(roomName);
        // this.users[1].join(roomName);

        // this.users[0].inGame = this.users[1].inGame = true;
        // this.users[0].searching = this.users[1].searching = false;
        //this.loadRes();
    }
    loadRes(){
        //отправка ресурсов карт
        pool.query(`select * from card where card_id in (select card_id from deck where user_id = ${this.users[0].userId} and pos is not null)`,
        (err,result1)=>{
            this.colodCards1 = [...result1];
            console.log(this.colodCards1);
            pool.query(`select * from card where card_id in (select card_id from deck where user_id = ${this.users[1].userId} and pos is not null)`,
            (err,result2)=>{
                this.colodCards2 = [...result2];
                this.io.to(this.users[0].id).emit("cardResLoad",[result1,result2]);
                this.io.to(this.users[1].id).emit("cardResLoad",[result2,result1]);

                
                
                this.readyAwait();
            });
        });
    }
    readyAwait(){
        let readyFlag = 0;
        this.users[0].on('loadingReady',()=>{
            readyFlag++;
        })
        this.users[1].on('loadingReady',()=>{
            readyFlag++;
        })
        this.timer = setInterval(() => {
            if(readyFlag >= 2){
                console.log("loading ready");
                clearInterval(this.timer);
                this.io.to(this.users[0].id).emit("sendEnemy",this.users[1].request.session.nickname);
                this.io.to(this.users[1].id).emit("sendEnemy",this.users[0].request.session.nickname);
                this.chooseAwait();
            }
        }, 500);
    }
    chooseAwait(){
        this.io.to(this.roomName).emit("ChooseCard");
        let readyFlag = 0;
        this.users[0].on('ChoosenCards',(msg)=>{
            this.sleeveCards1 = [...msg];
            readyFlag++;
        })
        this.users[1].on('ChoosenCards',(msg)=>{
            this.sleeveCards2 = [...msg];
            readyFlag++;
        })
        this.timer = setInterval(() => {
            if(readyFlag >= 2){
                console.log("cards choosen");
                clearInterval(this.timer);
                this.startGame();
            }
        }, 500);
    }
    roundChecker(){
        if(this.round == 1){
            this.changeRound(this.users[1]);
        }else{
            this.changeRound(this.users[0]);
        }
    }
    endRound(socket){
        if(socket.id == this.users[0].id){
            this.changeRound(this.users[1]);
        }else{
            this.changeRound(this.users[0]);
        }
        clearInterval(this.timer);
        this.timer = setInterval(bind(()=>{this.roundChecker()},this),60000);
    }

    startGame(){
        this.updateGold();
        let players = [this.users[0],this.users[1]];
        let player1 = players.splice(Math.round(0+Math.random()*(1 - 0)),1);//first player who starts round
        this.changeRound(player1);
        this.timer = setInterval(bind(()=>{this.roundChecker()},this),60000);
    }
    updateGold(){
        this.io.to(this.users[0].id).emit("updateGold",this.gold1);
        this.io.to(this.users[1].id).emit("updateGold",this.gold2);
    }
    changeRound(socket){
        if(socket.id == this.users[0].id){
            this.io.to(this.users[0].id).emit("round",1);
            this.io.to(this.users[1].id).emit("round",0);
            this.round = 1;
        }else{
            this.io.to(this.users[0].id).emit("round",0);
            this.io.to(this.users[1].id).emit("round",1);
            this.round = 2;
        }
        this.gold1+=2;
        this.gold2+=2;
        this.updateGold();
    }//who play as argument

    endGame(socket){//send looser
        let tmpsockets = [this.users[0],this.users[1]];
        for(let i = 0; i< tmpsockets.length; i++){
            this.pool.query(`UPDATE accounts set matches = matches +1 where id = ${tmpsockets[i].userId}`);
        }    
        pool.query(`UPDATE accounts set matches_win = matches_win +1 where id = ${(socket.id == this.users[0].id)?this.users[1].userId:this.users[0].userId}`);
        pool.query(`UPDATE accounts set rank_points = rank_points +1 where id = ${(socket.id == this.users[0].id)?this.users[1].userId:this.users[0].userId}`);

        this.io.to(this.roomName).emit('closeGame');
        pool.query(`SELECT rank_points from accounts where id = ${socket.userId}`,(err,res)=>{
            if(res[0].rank_points > 0){
                this.pool.query(`UPDATE accounts set rank_points = rank_points -1 where id = ${socket.userId}`);
            }
        })
        this.updateRanks(this.users[0]);
        this.updateRanks(this.users[1]);

        this.users[0].leave(this.roomName);
        this.users[1].leave(this.roomName);
        
        this.users[0].inGame = this.users[1].inGame = false;
    }
    updateRanks(socket){
        pool.query(`SELECT rank,rank_points from accounts where id = ${socket.userId}`,(err,res)=>{
            
            if(res[0].rank != null){
                pool.query(`SELECT * from ranks where condition = (select max(condition) from ranks where condition <= ${res[0].rank_points});`,(error,result)=>{
                    // console.log(result);
                    if(result != undefined){
                        if(res[0].rank!=result[0].rank_id){
                            pool.query(`UPDATE accounts set rank = ${result[0].rank_id} where id = ${socket.userId}`);
                        }
                    }else{
                        pool.query(`UPDATE accounts set rank = ${null} where id = ${socket.userId}`);
                    }
                });
            }else{
                pool.query(`SELECT * from ranks where rank_id = 1`,(error,result)=>{
                    // console.log(result);
                    if(res[0].rank_points >= result[0].condition){
                        pool.query(`UPDATE accounts set rank = ${result[0].rank_id} where id = ${socket.userId}`);
                    }
                })
            }
        });
    }
}
module.exports = Room;
