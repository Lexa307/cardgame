class Card{
    constructor(card_id,position,connection){
        let self = this;
        this.statuses = [];
        this.position = position;
        this.connection = connection;
        connection.query(`SELECT * from card where card_id = ${card_id}`,(error,result)=>{
            for(let i in result){
                self[i] = result[i]; 
            }
        })
    }
}