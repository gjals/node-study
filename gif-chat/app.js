const express= require('express');
const path= require('path');
const morgan= require('morgan');
const cookieParser= require('cookie-parser');
const session= require('express-session');
const nunjucks= require('nunjucks');
const dotenv= require('dotenv');
const webSocket= require('./socket');
dotenv.config();
const indexRouter= require('./routes');
const connect= require('./schemas');
const ColorHash= require('color-hash').default;

const app= express();
app.set('port', 8005);
app.set('view engine', 'html');
nunjucks.configure('views', { express: app, watch: true });
//watch (default: false) reload templates when they are changed
//express an express app that nunjucks should install to
connect();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
const sessionMiddleware= session({
    resave: false, 
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false
    }
})
app.use(sessionMiddleware);
app.use((req, res, next)=>{
    if(!req.session.color) {
        const colorHash= new ColorHash();
        req.session.color= colorHash.hex(req.sessionID); 
    }
    next();
});

app.use('/', indexRouter);

app.use((err, req, res, next) => {
    res.locals.message= err.message;
    res.render('error');
});
const server= app.listen(app.get('port'), ()=>{console.log('연결중')});
webSocket(server, app, sessionMiddleware);