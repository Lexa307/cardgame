import SocketClientWorker from './modules/socket.js';
import Game from './modules/game.js';
SocketClientWorker.socket.emit('ConnectToGame',GAME_ID);
SocketClientWorker.socket.on('PlayerReadyToStart',(playerName)=>{
    document.getElementById("status").childNodes.forEach(i => {i.remove()} );
    for(let i of playerName){
        let ConnectedPlayerElement = document.createElement('div');
        ConnectedPlayerElement.innerText = i;
        ConnectedPlayerElement.className = 'player';
        document.getElementById("status").appendChild(ConnectedPlayerElement);
    }
})
// let a = new Game(msg,a);