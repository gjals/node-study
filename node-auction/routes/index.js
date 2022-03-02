const express= require('express');
const multer= require('multer');
const path= require('path');
const fs= require('fs');
const { Good, Auction, User }= require('../models');
const { isLogin, isNotLogin }= require('./middlewares');
const schedule= require('node-schedule');
const router= express.Router();

router.use((req, res, next)=>{ res.locals.user= req.user; next(); });

router.get('/', async (req, res, next)=>{
    try {
        const goods= await Good.findAll({ where: { SoldId: null }});
        res.render('main', { goods });
    } catch (err) { console.error(err); next(err); }
});

router.get('/join', isNotLogin, (req, res)=>{ console.log('index join start'); res.render('join'); });

router.get('/good', isLogin, (req, res)=>{ res.render('good'); });

try { fs.readdirSync('uploads'); } catch (err) { fs.mkdirSync('uploads'); }
const upload= multer({ storage: multer.diskStorage({ destination(req, file, cb) { cb(null, 'uploads');}, 
    filename(Req, file, cb) {
        const ext= path.extname(file.originalname);
        cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext); //Date.now와 별 차이 x. now가 익스8을 지원안한다어쩌구
    }
}), limits: { fileSize: 10*1024*1024 }});

//formdata를 따로 만들어서 넘겨주지 않아서 upload.single 이거 인자를 폼의 네임으로 줌
router.post('/good', isLogin, upload.single('good_img'), async (req, res, next)=>{
    try {
        const { good_name: name, good_price: price }= req.body;
        const exGood= await Good.create({ OwnerId: req.user.id, name, img: req.file.filename, price });

        const end= new Date();
        end.setDate(end.getDate() + 1);
        schedule.scheduleJob(end, async()=>{
            const success= await Auction.findOne({ where:{ GoodId: exGood.id}, order:[['bid', 'DESC']]});
            await Good.update({ SoldId: success.UserId}, { where: { id: exGood.id }});
            await User.update({ money: sequelize.literal(`money-${success.bid}`)}, { where: { id: success.UserId }});
        });
        res.redirect('/');
    } catch (err) { console.error(err); next(err); }
});

router.get('/good/:id', isLogin, async (req, res, next)=>{
    try {
        const [good, auction]= await Promise.all([
            Good.findOne({ where: { id: req.params.id }, include: { model: User, as:'Owner' }}),
            Auction.findAll({ where: { GoodId: req.params.id }, include: { model: User }, order: [[ 'bid', 'ASC' ]]})
        ]);
        res.render('auction', { good, auction });
    } catch (err) { console.error(err); next(err); }
});

router.post('/good/:id/auction', isLogin, async (req, res, next)=>{
    try {
        console.log(req.user.id, req.body.me); //두 개가 서로 달라짐,,왜지?
        const { bid, msg }= req.body;
        const good= await Good.findOne({
            where: { id: req.params.id }, include: { model: Auction }, order: [[{ model: Auction }, 'bid', 'DESC' ]]
        });
        if(good.price > bid) return res.status(403).send('시작 가격보다 높게 입찰해야 함');
        if(new Date(good.createdAt).valueOf() + (24*60*60*1000) < new Date()) return res.status(403).send('판매 이미 종료됨');
        if(good.Auctions[0] && good.Auctions[0].bid >= bid) return res.status(403).send('이전 입찰가보다 높아야 함');

        const result= await Auction.create({ bid, msg, UserId: req.user.id, GoodId: req.params.id });
        req.app.get('io').to(req.params.id).emit('auction',{ bid: result.bid, msg: result.msg, nick: req.user.nick });
        return res.send('ok');
    } 
    catch (err) { console.error(err); next(err); }
});

router.get('/list', isLogin, async (req, res, next)=>{
    try {
        const goods= await Good.findAll({ where: { soldId: req.user.id}, include: { model: Auction }, order:[[ {model: Auction}, 'bid', 'DESC']] });
        res.render('list', { goods });
    } catch (err) { console.error(err); next(err); }
})

module.exports= router;
