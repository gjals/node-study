const express= require('express');
const multer= require('multer');
const path= require('path');
const fs= require('fs');
const { Post, Hashtag }= require('../models');
const { isLogin }= require('./middlewares');
const router = require('./auth');
const Router= express.Router();
//http://expressjs.com/en/resources/middleware/multer.html 참고
try {
    fs.readFileSync('uploads');
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
            //originalname Name of the file on the user’s computer
        }
    }),
    limits: { fileSize: 5*1024*1024 },
});

router.post('/img', isLogin, upload.single('img'), (req, res)=>{
    res.json({url: `/img/${req.file.filename}`});
    //document.getElementById('post-image-preview').src= res.data.url; 에서 씀
});

const upload2= multer();
router.post('/', isLogin, upload2.none(), async (req, res, next) => {
    //<form id="post-form" action="/post" method="post" 에서 씀
    try {
        const post= await Post.create({
            content: req.body.content,
            img: req.body.url,
            UserId: req.body.id,
        });
    } catch (err) {
        
    }
})
