const express= require('express');
const path= require('path');
const morgan= require('morgan');
const nunjucks= require('nunjucks');

const { sequelize } = require('./models');

const indexRouter= require('./routes/index');
//const usersRouter= require('./routes/users');
//const commentsRouter= require('./routes/comments'); //순서 바뀌어도 가능?

const app= express();
app.set('port', process.env.PORT || 3001);
app.set('view engine', 'html');
nunjucks.configure('views', { 
    express: app,
    watch: true,
});

sequelize.sync({force: false})
    .then(() => {
        console.log('디비 연결 성공');
    })
    .catch((err) => {
        console.log(err);
    });

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));    //얘랑 밑에 use 2개랑 순서를 뒤바꾸면 라우터가 없습니다 에러가 남
//얘가 실행되면 폴더에 파일과 연결되기 때문에 저 에러가 안난듯 
//https://stackoverflow.com/questions/38020349/node-express-4-middleware-not-working 참고
app.use(express.json()); //json 뒤에 () 안붙여서 하루종일 에러찾음 ㅅㄱ
app.use(express.urlencoded({ extended: false}));

app.use('/', indexRouter, () => {console.log('use 실행됨!')});
//app.use('/users', usersRouter);
//app.use('/comments', commentsRouter); //순서바뀌어도 ㄱㄴ?

app.use((req, res, next) => {
    const error= new Error(`${req.method} ${req.url} 라우터가 없습니다`);
    error.status= 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.log('aasdf');
    res.locals.message= err.message;
    res.locals.error= process.env.NODE_ENV !== 'production'? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(3001, ()=> {
    console.log(3001, '빈 포트 대기중');
});

