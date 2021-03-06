const express= require('express');
const cookieParser= require('cookie-parser');
const morgan= require('morgan');
const path= require('path');
const session= require('express-session');
const nunjucks= require('nunjucks');
const dotenv= require('dotenv');

dotenv.config(); //이걸 해야 process.env로 쓸 수 있음 안하면 undefied
const indexRouter= require('./routes/index');
const authRouter= require('./routes/auth');
const v1Router= require('./routes/v1');
const v2Router= require('./routes/v2');
const { sequelize }= require('./models');
const passport= require('passport');
const passportConfig= require('./passport')
// const postRouter= require('./routes/post');
// const userRouter= require('./routes/user');

const app= express();
passportConfig();
app.set('port', process.env.PORT || 8002);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});
sequelize.sync({force:false}).then(()=>{console.log('연결 성공');}).catch((err)=>{console.error(err);});

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json()); // 이 두개는 쓸 때와 안 쓸 때 큰 차이를 모르겠음
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/v1', v1Router);
app.use('/v2', v2Router);
// app.use('/user', userRouter);
// app.use('/post', postRouter);
app.use((req, res, next) => {
    next(err);
});
app.use((err, req, res, next) => {
    res.locals.message= err.message;
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'));
})

