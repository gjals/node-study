const express= require('express');
const path= require('path');
const morgan= require('morgan');
const nunjucks= require('nunjucks');

const { sequelize, User } = require('./models');

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
app.use(express.json);
app.use(express.urlencoded({ extended:false}));

// (async function() {      
//     try {
//         console.log('시작');
//         // const { Op }= require('sequelize');
//         // User.create({
//         //     name:'zero',
//         //     age: 24,
//         //     married: false,
//         //     comment: '자기소개',
//         // });

//         // const user= await User.findAll({});
//         // user.forEach((value) => {
//         //     console.log(JSON.stringify(value));
//         // });

//         const Comment= require('./models/comment');

//         // const user= await User.findOne({});
//         // const comments= await user.getComments();
//         // console.log(comments);
//         await Comment.create({
//             commenter: 3,
//             comment: 'success',
//         });
//         const user= await User.findOne({
//             include: [{
//                 model: Comment,
//                 where: {
//                     id: 4,
//                 },
//                 attributes: ['id'],
//             }]
//         });
//         console.log(JSON.stringify(user));

//         // User.findAll({ include: [ Comment ] }).then(comment => {
//         //     console.log(JSON.stringify(comment))
//         // });

//         // const user= await User.findOne({ 
//         //     include: [{
//         //         model: Comment,
//         //     }] 
//         // });
//         // console.log(user.Comments);
//         // const user= await User.findOne({});
        
//         // console.log(user.get('name'));
            
//     } catch(err) {
//         console.log('실패');
//         console.log(err);
//     }
// })();

app.use((err, req, res, next) => {
    console.log('aasdf');
    res.locals.message= err.message;
    res.locals.error= process.env.NODE_ENV !== 'production'? err : {};
    res.status(err.status || 500);
    res.render('error');
    
});

app.listen(3001, ()=> {
    console.log(3001, '빈 포트 대기중');
})

