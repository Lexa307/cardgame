//init client socket;
let socket = io();

let SocketClientWorker = {
    'socket':socket,
}
export default SocketClientWorker;