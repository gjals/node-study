const express= require('express');
const multer= require('multer');
const path= require('path');
const fs= require('fs');
const { Post, Hashtag }= require('../models');
const { isLogin }= require('./middlewares');
const router= express.Router();
//http://expressjs.com/en/resources/middleware/multer.html 참고
try {
    console.log('uploads 폴더 확인');
    fs.readdirSync('uploads');
} catch (err) {
    fs.mkdirSync('uploads');
}

const upload= multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext= path.extname(file.originalname); //확장자만 줌 asdf.html이면 '.html'
            cb(null, path.basename(file.originalname, ext)+Date.now()+ext);
            //originalname: Name of the file on the user’s computer
        },
    }),
    limits: { fileSize: 10*1024*1024 },
});

router.post('/img', isLogin, upload.single('img'), (req, res)=>{ 
    console.log('/img 잘 도착하고 됨', req.file);
    //. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.
    res.json({url: `/img/${req.file.filename}`});
    //document.getElementById('post-image-preview').src= res.data.url; 에서 씀
    //static으로 img로 하면 uploads 폴더로 연결해줌
});

const upload2= multer();
router.post('/', isLogin, upload2.none(), async (req, res, next) => {
    //<form id="post-form" action="/post" method="post" 에서 씀
    try {
        console.log(req.body.url);
        console.log(req.body.post_image_url);
        console.log(req.body.post_text);
        const post= await Post.create({
            content: req.body.post_text,
            img: req.body.post_image_url,
            UserId: req.user.id, // req.user은 어디서 온거지??
        });
        //https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Regular_Expressions
        //https://heropy.blog/2018/10/28/regexp/
        //g 모든 문자열에서 검사, [^ ] <- 이 아닌 문자열, \s는 공백 의미, +는 1회 이상 반복 가능
        const hashtags= req.body.post_text.match(/#[^\s#]+/g);
        if(hashtags) {
            const result= await Promise.all(//왜 굳이 프로미스를 쓰지?
                hashtags.map(tag => {
                    return Hashtag.findOrCreate({
                        where: { title: tag.slice(1).toLowerCase() },
                    })
                }),
            );
            await post.addHashtags(result.map(r=>r[0]));
        }
        console.log('/post end');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports= router;