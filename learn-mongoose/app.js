const express= require('express');
const path= require('path');
const morgan= require('morgan');
const nunjucks= require('nunjucks');
const connect= require('./schemas');

const indexRouter= require('./routes');
const userRouter= require('./routes/users');
const commentRouter= require('./routes/comments')

const app= express();
app.set('port', process.env.PORT || 3002);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});
connect();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public'))); //절대 경로로 폴더를 지정하면 이 폴더 안에 파일들을 /static/파일이름으로 접근가능
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/comments', commentRouter);

app.use((req,res,next) => {
    const error= new Error(`${req.method} ${req.url} 라우터가 없습니다`);
    error.status= 404;
    next(error);
});
app.use((err, req, res, next) => {
    res.locals.message= err.message;
    res.locals.error= process.env.NODE_ENV !== 'production'? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), ()=>{
    console.log(app.get('port'), '포트 대기중');
})
