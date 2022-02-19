const express= require('express');
const cookieParser= require('cookie-parser');
const morgan= require('morgan');
const path= require('path');
const session= require('express-session');
const nunjucks= require('nunjucks');
const dotenv= require('dotenv');

dotenv.config(); //이걸 해야 process.env로 쓸 수 있음 안하면 undefied
const indexRouter= require('./routes/index');

const app= express();
app.set('port', process.env.PORT || 4000);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});

app.use(morgan('dev'));
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
app.use('/', indexRouter);
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

