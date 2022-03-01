const express= require('express');
const path= require('path');
const morgan= require('morgan');
const cookieParser= require('cookie-parser');
const session= require('express-session');
const passport= require('passport');
const nunjuckst= require('nunjucks');
const dotenv= require('dotenv');
dotenv.config();
const indexRouter= require('./routes');
const authRouter= require('./routes/auth');
const { sequelize }= require('./models');
const passportConfig= require('./passport');
const sse= require('./sse');
const webSocket= require('./socket');

const app= express();
passportConfig();
app.set('port', 8010);
app.set('view engine', 'html');
nunjuckst.configure('views', {express: app, watch: true});
sequelize.sync({force: false}).then(()=>console.log('db success')).catch((err)=>console.error(err));

const sessionMiddleware= session({ 
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: { httpOnly: true, secure: false }
});
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use((err, req, res, next)=>{
    res.locals.message= err.message;
    console.error(err);
    res.render('error');
});
const server= app.listen(app.get('port'), ()=>console.log('8010 port'));
webSocket(server, app);
sse(server);