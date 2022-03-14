const SocketIO= require('socket.io');
const axios= require('axios').default;
const cookieParser= require('cookie-parser');
const cookie= require('cookie-signature');

module.exports= function (server, app, sessionMiddleware) {
    const io= SocketIO(server, { path: '/socket.io', allowEIO3: true }); //Sets the path value under which engine.io and the static files will be served. Defaults to /socket.io.
    app.set('io', io);
    const post= io.of('/post');

    io.use((socket, next)=>{ 
        cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res, next); 
        sessionMiddleware(socket.request, socket.request.res, next); //실행을 위해 (req, res, next)를 한건가?
    });
    
    post.on('connection', (socket)=>{
        const req= socket.request;
        socket.join(req.sessionID); //이게 언제 실행되지?
        console.log('post namespace start', req.sessionID);
        socket.on('disconnect', async ()=> {
            socket.leave(req.sessionID); 
            console.log('post namespace disconnect');
        })
    });
};