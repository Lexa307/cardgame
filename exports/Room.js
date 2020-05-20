class Room{
    constructor(io,connection,roomName,socket1,socket2){
        this.connection = connection;
        this.io = io;
        this.roomName = roomName;
        this.socket1 = socket1;
        this.socket2 = socket2;

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
            this.connection.query(`select * from card where card_id in (select card_id from deck where user_id = ${this.socket2.userId} and pos is not null)`,
            (err,result2)=>{
                let Result = Object.assign({}, result1, result2);
                this.io.to(this.roomName).emit("cardResLoad",Result);
            })
        });
    }
    startGame(){

    }
    endGame(socket){//send looser
        let tmpsockets = [this.socket1,this.socket2];
        for(let i = 0; i< tmpsockets.length; i++){
            this.connection.query(`UPDATE accounts set matches = matches +1 where id = ${tmpsockets[i].userId}`);
        }
        this.connection.query(`UPDATE accounts set matches_win = matches_win +1 where id = ${(socket.id == this.socket1.id)?this.socket2.userId:this.socket1.userId}`);

        this.io.to(this.roomName).emit('closeGame')

        this.socket1.leave(this.roomName);
        this.socket2.leave(this.roomName);
        
        this.socket1.inGame = this.socket2.inGame = false;
    }
}
module.exports = Room;
