import SocketClientWorker from './modules/socket.js';
import Game from './modules/game.js';
SocketClientWorker.socket.emit('ConnectToGame',GAME_ID,USER_ID);
SocketClientWorker.socket.on('PlayerReadyToStart',(playerName)=>{
    let StatusNode = document.getElementById("status");
    while (StatusNode.firstChild) {
        StatusNode.removeChild(StatusNode.lastChild);
      }
    for(let i of playerName){
        let ConnectedPlayerElement = document.createElement('div');
        ConnectedPlayerElement.innerText = i;
        ConnectedPlayerElement.className = 'player';
        StatusNode.appendChild(ConnectedPlayerElement);
    }
})
// let a = new Game(msg,a);