const SocketIO= require('socket.io');

module.exports= function (server) {
    const io= SocketIO(server, { path: '/socket.io'});

    io.on('connection', (socket) => {
        const req= socket.request;
        const ip= req.headers['x-forwarded-for']  || req.socket.remoteAddress; //connection은 deprecated됨
        console.log('새로운 클라이언트 접속', ip, socket.id, req.ip);

        socket.on('reply', (data)=>console.log(data));
        socket.on('error', (error)=>console.error(err));
        socket.on('disconnect', ()=>{ console.log('클라이언트 접속 해제', ip, socket.id); clearInterval(socket.interval); });
        socket.interval= setInterval(()=>{
            socket.emit('news', 'Hello Socket.IO');
        }, 3000);
    });
};


// module.exports= function (server) {
//     const wss= new WebSocket.Server({ server });

//     wss.on('connection', (ws, req) => {
//         const ip= req.headers['x-forwarded-for']  || req.socket.remoteAddress; //connection은 deprecated됨
//         console.log('새로운 클라이언트 접속', ip);
//         ws.on('message', (message)=>console.log(message.toString()));
//         ws.on('error', (error)=>console.error(err));
//         ws.on('close', ()=>{ console.log('클라이언트 접속 해제'); clearInterval(ws.interval); });
//         ws.interval= setInterval(()=>{
//             if(ws.readyState === ws.OPEN) ws.send('서버에서 클라이언트로 메세지를 보냅니다');
//         }, 3000);
//     });
// };