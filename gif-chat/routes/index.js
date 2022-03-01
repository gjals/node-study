const express= require('express');
const router= express.Router();
const Room= require('../schemas/room');
const Chat= require('../schemas/chat');
const multer= require('multer');
const path= require('path');
const fs= require('fs');
const ColorHash= require('color-hash').default;

try { fs.readdirSync('uploads'); } catch(err) { fs.mkdirSync('uploads'); }

// const upload= multer({ storage: multer.diskStorage({ destination(req, file, done) { done(null, 'uploads/') }, filename(req, file, done) {
//     const ext= path.extname(file.originalname);
//     console.log('multer 실행됨');
//     done(null, path.basename(file.originalname, ext) + Date.now() + ext);
// }}), limits: {fileSize: 10*1024*1024}
// });

const upload= multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext= path.extname(file.originalname); //확장자만 줌 asdf.html이면 '.html'
            cb(null, path.basename(file.originalname, ext)+Date.now()+ext);
            //originalname Name of the file on the user’s computer
        },
    }),
    limits: { fileSize: 10*1024*1024 },
});

router.get('/', async (req, res)=>{
    try {
        const rooms= await Room.find({});
        res.render('main', { rooms });
    } catch (err) { console.error(err); next(err); }
});

router.get('/room', (req, res)=>{
    res.render('room');
});

router.post('/room', async (req, res, next)=>{
    try {
        console.log(req.body);
        console.log(req.body.room_title, req.body.room_max, req.body.room_password);
        const newRoom= await Room.create({
            title: req.body.room_title,
            max: req.body.room_max,
            owner: req.session.color,
            password: req.body.room_password,
        });
        const io= req.app.get('io');
        io.of('/room').emit('newRoom', newRoom);
        res.redirect(`/room/${newRoom._id}?password=${req.body.room_password}`);
    } catch (err) { console.error(err); next(err); }
});

let userList= [];
router.get('/room/:id', async (req, res, next)=>{
    try {
        //const colorHash= new ColorHash();
        const room= await Room.findOne({ _id: req.params.id });
        const io= req.app.get('io');
        //console.log(req.params.id, room.password, req.query.password);
        if(!room) return res.redirect('/?error=존재하지 않는 방입니다');
        if(room.password && room.password !== req.query.password) return res.redirect('/?error=비밀번호가 틀렸습니다');

        const { rooms }= io.of('/chat').adapter;
        if(rooms && rooms[req.params.id] && room.max <= rooms[req.params.id].length) return res.redirect('/?error=허용인원을 초과함');
        
        // 이 방에 접속중인 소켓 목록이 나온대, chat.html render하고 chat socket을 가짐 = 방에 들어가 있음
        
        userList= [];
        console.log(req.params.id, '방');
        await io.of('/chat').to(req.params.id).emit('userList');
        setTimeout(function(){}, 1000);
        userList.push(req.session.color);
        const chats= await Chat.find({ room: room._id }).sort('createdAt');
        console.log('index get room render ', req.session.color);
        return res.render('chat', { room, chats, user: req.session.color, userList});
    } catch (err) { console.error(err); next(err); }
});


router.delete('/room/:id', async (req, res, next)=>{
    try {
        console.log('routes  index delete start');
        await Room.remove({ _id: req.params.id });
        await Chat.remove({ room: req.params.id });
        res.send('ok');
        setTimeout(()=>{ req.app.get('io').of('/room').emit('removeRoom', req.params.id); }, 2000);
    } catch (err) { console.error(err); next(err); }
});

router.post('/room/:id/chat', upload.single('gif'), async (req, res, next)=>{
    try {
        //formdata를 보냈지만 req에서 못쓰는 이유는 바디파서가 이러한 multipart/formdata를 처리하지 못하기 때문. multer와 같은 모듈을 사용해야만 formdata를 읽을 수 있음
        //multer 모듈에서 파일은 req.file에 text field는 req.body.name 으로 넣어줌
        console.log('채팅내용', req.body.text);
        const chat= await Chat.create({
            room: req.params.id,
            user: req.session.color,
            chat: req.body? req.body.text : null,
            gif: req.file? req.file.filename : null
        });
        req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
        res.send('ok');
    } catch (err) {console.error(err); next(err); }
});

module.exports= router;