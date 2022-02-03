var express = require('express');
var app = express();
var PORT = 3000;

// View engine setup
app.set('view engine', 'ejs'); //User.html이 아닌 User.ejs를 참고하게 됨
// 따로 설치가 필요했음. npm install ejs

// With middleware
app.use('/', function(req, res, next){
    res.render('User')
    next();
});

app.get('/', function(req, res){
    console.log("Render Working")
    //res.send();
});

app.get('/comment', (req, res) => {
    res.send('get 실행');
    console.log('get comment 실행');
});

app.use('/comment', (req, res, next) => {
    console.log('use 실행');
    next();
});

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});