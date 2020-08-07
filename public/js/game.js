import SocketClientWorker from './modules/socket.js';
import Game from './modules/game.js';
SocketClientWorker.socket.emit('ConnectToGame',GAME_ID);
let a = new Game(msg,a);