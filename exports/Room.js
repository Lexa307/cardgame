class Room{
    constructor(io,connection,roomName,socket1,socket2){
        this.connection = connection;
        this.io = io;
        this.roomName = roomName;
        this.socket1 = socket1;
        this.socket2 = socket2;

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

        this.socket1.join(roomName);
        this.socket2.join(roomName);

        this.socket1.inGame = this.socket2.inGame = true;
        this.socket1.searching = this.socket2.searching = false;
        this.loadRes();
    }
    loadRes(){
        //отправка ресурсов карт
        this.connection.query(`select * from card where card_id in (select card_id from deck where user_id = ${this.socket1.userId} and pos is not null)`,
        (err,result1)=>{
            this.colodCards1 = [...result1];
            console.log(this.colodCards1);
            this.connection.query(`select * from card where card_id in (select card_id from deck where user_id = ${this.socket2.userId} and pos is not null)`,
            (err,result2)=>{
                this.colodCards2 = [...result2];
                this.io.to(this.socket1.id).emit("cardResLoad",[result1,result2]);
                this.io.to(this.socket2.id).emit("cardResLoad",[result2,result1]);

                
                
                this.readyAwait();
            });
        });
    }
    readyAwait(){
        let readyFlag = 0;
        this.socket1.on('loadingReady',()=>{
            readyFlag++;
        })
        this.socket2.on('loadingReady',()=>{
            readyFlag++;
        })
        this.timer = setInterval(() => {
            if(readyFlag >= 2){
                console.log("loading ready");
                clearInterval(this.timer);
                this.io.to(this.socket1.id).emit("sendEnemy",this.socket2.request.session.nickname);
                this.io.to(this.socket2.id).emit("sendEnemy",this.socket1.request.session.nickname);
                this.chooseAwait();
            }
        }, 500);
    }
    chooseAwait(){
        this.io.to(this.roomName).emit("ChooseCard");
        let readyFlag = 0;
        this.socket1.on('ChoosenCards',(msg)=>{
            this.sleeveCards1 = [...msg];
            readyFlag++;
        })
        this.socket2.on('ChoosenCards',(msg)=>{
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

    startGame(){
        this.updateGold();
    }
    updateGold(){
        this.io.to(this.socket1.id).emit("updateGold",this.gold1);
        this.io.to(this.socket2.id).emit("updateGold",this.gold2);
    }

    endGame(socket){//send looser
        let tmpsockets = [this.socket1,this.socket2];
        for(let i = 0; i< tmpsockets.length; i++){
            this.connection.query(`UPDATE accounts set matches = matches +1 where id = ${tmpsockets[i].userId}`);
        }    
        this.connection.query(`UPDATE accounts set matches_win = matches_win +1 where id = ${(socket.id == this.socket1.id)?this.socket2.userId:this.socket1.userId}`);
        this.connection.query(`UPDATE accounts set rank_points = rank_points +1 where id = ${(socket.id == this.socket1.id)?this.socket2.userId:this.socket1.userId}`);

        this.io.to(this.roomName).emit('closeGame');
        this.connection.query(`SELECT rank_points from accounts where id = ${socket.userId}`,(err,res)=>{
            if(res[0].rank_points > 0){
                this.connection.query(`UPDATE accounts set rank_points = rank_points -1 where id = ${socket.userId}`);
            }
        })
        this.updateRanks(this.socket1);
        this.updateRanks(this.socket2);

        this.socket1.leave(this.roomName);
        this.socket2.leave(this.roomName);
        
        this.socket1.inGame = this.socket2.inGame = false;
    }
    updateRanks(socket){
        this.connection.query(`SELECT rank,rank_points from accounts where id = ${socket.userId}`,(err,res)=>{
            
            if(res[0].rank != null){
                this.connection.query(`SELECT * from ranks where condition = (select max(condition) from ranks where condition <= ${res[0].rank_points});`,(error,result)=>{
                    // console.log(result);
                    if(result != undefined){
                        if(res[0].rank!=result[0].rank_id){
                            this.connection.query(`UPDATE accounts set rank = ${result[0].rank_id} where id = ${socket.userId}`);
                        }
                    }else{
                        this.connection.query(`UPDATE accounts set rank = ${null} where id = ${socket.userId}`);
                    }
                });
            }else{
                this.connection.query(`SELECT * from ranks where rank_id = 1`,(error,result)=>{
                    // console.log(result);
                    if(res[0].rank_points >= result[0].condition){
                        this.connection.query(`UPDATE accounts set rank = ${result[0].rank_id} where id = ${socket.userId}`);
                    }
                })
            }
        });
    }
}
module.exports = Room;
