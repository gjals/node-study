const express= require('express');
const path= require('path');
const morgan= require('morgan');
const nunjucks= require('nunjucks');
const connect= require('./schemas');

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

