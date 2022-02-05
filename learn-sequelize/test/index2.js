var express = require('express');
const path= require('path');
const morgan= require('morgan');
const nunjucks= require('nunjucks');
const { User, Comment } = require('../models');
const { sequelize } = require('../models/index');
var app = express();
var PORT = 3000;

sequelize.sync({force: false})
    .then(() => {
        console.log('디비 연결 성공');
    })
    .catch((err) => {
        console.log(err);
    });

// View engine setup
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs'); //'User.html이 아닌 User.ejs를 참고하게 됨
// 따로 설치가 필요했음. npm install ejs

app.use(morgan('dev'));
//app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'public')));    //얘랑 밑에 use 2개랑 순서를 뒤바꾸면 라우터가 없습니다 에러가 남
//app.set('views', path.join(__dirname, ''));
app.use(express.json()); //json 뒤에 () 안붙여서 하루종일 에러찾음 ㅅㄱ
app.use(express.urlencoded({ extended: false}));

//console.log(__dirname);
// With middleware
app.get('/', async function(req, res, next){
    try {
        console.log('get / 실행!');
        const moods= await Comment.findAll({
            include: {
                model: User,
                where: {id:'1'},
            },
        });
        res.send('render_mood', {moods: moods}); //새로고침을 해야만 요소가 추가됨
        //next();
    } catch (err) {
        console.log('err! ' + err);
    }
    
});

app.post('/mood', async (req, res, next) => {
    const comment= await Comment.create({
        comment: req.body.mood,
        commenter: '1',
    });
    res.json(comment);
})

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});