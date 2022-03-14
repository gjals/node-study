const express= require('express');
const cookieParser= require('cookie-parser');
const morgan= require('morgan'); //로그로 상세하게 출력해줌 morgan
const path= require('path');
const session= require('express-session');
const nunjucks= require('nunjucks');
const BodyParser= require('body-parser');
const dotenv= require('dotenv');
dotenv.config(); //이걸 해야 process.env로 쓸 수 있음 안하면 undefied

const pageRouter= require('./routes/page');
const authRouter= require('./routes/auth');
const { sequelize }= require('./models');
const passport= require('passport');
const passportConfig= require('./passport')
const postRouter= require('./routes/post');
const userRouter= require('./routes/user');
const bookRouter= require('./routes/book');
const logger= require('./logger');
const helmet= require('helmet');
const hpp= require('hpp');
const webSocket= require('./socket');


const app= express();
passportConfig();
app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});
sequelize.sync({force:false}).then(()=>{console.log('연결 성공');}).catch((err)=>{console.error(err);});

if(process.env.NODE_ENV==='production')
    app.use(morgan('combined'));
else app.use(morgan('dev'));
app.use(BodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json()); // 이 두개는 쓸 때와 안 쓸 때 큰 차이를 모르겠음
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
const sessionOption= {
    resave: false,                                                                                      
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },                                                                               
};
if(process.env.NODE_ENV==='production') {
    sessionOption.proxy= true;
    app.use(helmet({ contentSecurityPolicy: false}));
    app.use(hpp());
}

const sessionMiddleware= session(sessionOption);
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());
app.use('/', pageRouter);                                                                       
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/post', postRouter); 
app.use('/book', bookRouter);

app.use((req, res, next) => {
    const err= new Error(`${req.method}${req.url} 라우터가 없습니다`);
    logger.info('hello');
    logger.error(err.message);
    next(err);
});
app.use((err, req, res, next) => {
    res.locals.message= err.message;
    console.error(err.message);
    res.render('error');
});

const server= app.listen(app.get('port'), () => {
    console.log(app.get('port'));
})
webSocket(server, app, sessionMiddleware);
