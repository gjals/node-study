const SocketIO= require('socket.io');
const axios= require('axios').default;
const cookieParser= require('cookie-parser');
const cookie= require('cookie-signature');

module.exports= function (server, app, sessionMiddleware) {
    const io= SocketIO(server, { path: '/socket.io'}); //Sets the path value under which engine.io and the static files will be served. Defaults to /socket.io.
    app.set('io', io);
    const room= io.of('/room');
    const chat= io.of('/chat');

    io.use((socket, next)=>{ 
        cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res, next); 
        sessionMiddleware(socket.request, socket.request.res, next); //실행을 위해 (req, res, next)를 한건가?
    });
    room.on('connection', (socket)=>{
        console.log('room namespace start');
        socket.on('disconnect', ()=>console.log('room namespace end'));
    });
    chat.on('connection', (socket)=>{
        console.log('chat namespace start');
        const req= socket.request;
        console.log('요청 리퀘스트', req);
        const { headers: { referer }}= req; //req에서 header객체안에 referer변수? 객체? 불러옴
        //Referer 요청 헤더는 현재 요청을 보낸 페이지의 절대 혹은 부분 주소
        
        const roomId= referer.split('/')[referer.split('/').length-1].replace(/\?.+/, '');
        socket.join(roomId); //이게 언제 실행되지?
        socket.to(roomId).emit('join', { user:'system', chat:`${req.session.color}님이 입장함`, name: `${req.session.color}`}); //새로고침만 해도 소켓이 connect disconnect되나봄

        //새로고침을 하면 소켓이 끊어졌다 재연결됨, 그래서 혼자 있을 때 새로고침을 하면 퇴장이 되서 0명이 되어 방이 삭제되버림
        //같은 브라우저 탭 여러개로 하니 같은 사용자로 인식함
        socket.on('disconnect', async ()=> {
            socket.leave(roomId); 

            const currentRoom= socket.adapter.rooms[roomId];
            const userCount= currentRoom? currentRoom.length : 0;
            if(userCount === 0) {
                const signedCookie= req.signedCookies['connect.sid'];//요청에서 서명된 쿠키를 가져옴
                console.log('세션 쿠키', signedCookie);
                const connectSID= cookie.sign(signedCookie, process.env.COOKIE_SECRET); //다시 쿠키를 암호화함?
                console.log(referer, roomId, connectSID);
                await axios.delete(`http://localhost:8005/room/${roomId}`, { headers: {Cookie: `connect.sid=s%3A${connectSID}`}}).then(()=>console.log('success')).catch((err)=>console.error(err));
            }
            else
                socket.to(roomId).emit('exit', {user: 'system', chat:`${req.session.color}님이 퇴장함`, name: `${req.session.color}`});
        });
    })
};
 // const webSocket= new WebSocket("ws://localhost:8005");
        // webSocket.onopen= function () { console.log('서버와 웹소켓 연결 성공 ')};
        // webSocket.onmessage= function (event) { console.log(event.data); webSocket.send('클라이언트에서 서버로 답장 보냄'); };

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
/**
 * io.on('connection', (socket) => {
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
 */