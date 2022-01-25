const express= require('express');
const path= require('path');
const app= express();
const cookieParser= require('cookie-parser');
const session= require('express-session');
const dotenv= require('dotenv');
const morgan = require('morgan');

dotenv.config();
app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('short'));
app.use('/asdf', express.static(path.join(__dirname, 'public')));
//app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave:false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    name: 'session-cookie',
}));

const multer = require('multer');
const fs= require('fs');
const { PassThrough } = require('stream');

try {
    fs.readdirSync('uploads');
} catch(err) {
    console.log('uploads dir making...');
    fs.mkdirSync('uploads');
}

const upload= multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, 'uploads/');
        },
        filename(req, file, done) {
            const ext= path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5*1024*1024 }, 
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'multipart.html'));
});

app.post('/upload', upload.fields([ { name:'image1'}, {name:'image2'}]),
    (req, res) => {
        console.log(req.files, req.body);
        res.send('ok');
    }
);


app.use((req, res, next) => {
    console.log('모든 요청에 다 실행됩니다');
    next();
})
// app.get('/', (req, res, next) => {
//     console.log('get / 요청에만 실행');
//     res.send('asdf');
//     //next();
// }); 

// app.get('/asdf', (req, res, next) => {
//     console.log('next 써서 실행');
//     res.send('dddd');
//     next();
// });

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
})

app.listen(app.get('port'), () => {
    console.log(path.join(__dirname, '/public'));
    console.log(app.get('port'), '번 포트에서 대기')
});

