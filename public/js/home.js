import SocketClientWorker from './modules/socket.js';

let a = null;
document.getElementById("SearhButton").addEventListener('click',findGame,false);
document.getElementById("cancel").addEventListener('click',canselSearch,false);
document.getElementById("exit").addEventListener('click',exitFromSystem,false);
SocketClientWorker.socket.emit("getAccData");

// SocketClientWorker.socket.on("cardResLoad",(msg)=>{
//   setTimeout(()=>{a = new Game(msg,a);},1000)
// });
SocketClientWorker.socket.on("gameFounded",(msg)=>{
  console.log(msg);
  document.getElementById('cancel_field').style.visibility = "hidden";
  document.getElementById('search_status_text').innerText = `Игра найдена!\nЗапуск матча...`
  window.location.href = `/${msg}`;
  
});
SocketClientWorker.socket.on("accData",(msg)=>{
  document.getElementById('accInfo').innerText = 
`${msg.nickname}
боев:${msg.battles}
побед:${msg.win}
ранг:${msg.rank}
золота:${msg.gold}`
});

function exitFromSystem(){
  let xhr = new XMLHttpRequest();
  let body = '';
  xhr.open("POST", '/exit', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = ()=>{
    window.location.reload();
  }
  xhr.send(body);
}

function findGame(){
  SocketClientWorker.socket.emit('searching', 'username');
  document.getElementById('wrapper').style.display = 'none';
  document.getElementById('serchPanel').style.display = 'block';
  document.getElementById('cancel_field').style.visibility = "visible";
  document.getElementById('search_status_text').innerText = `Поиск игроков...`
}
function canselSearch(){
  SocketClientWorker.socket.emit('cancelSearch');
  document.getElementById('wrapper').style.display = 'block';
  document.getElementById('serchPanel').style.display = 'none';
}


