const express= require('express');
const jwt= require('jsonwebtoken');
const { verifyToken, apiLimiter }= require('./middlewares');
const { Domain, User, Post, Hashtag }= require('../models');
const router= express.Router();
const cors= require('cors');
const url= require('url');

//router.use(cors({ credentials: true }));
//axios.defaults.headers.origin= 'http://localhost:4000';
router.use(async (req, res, next) => {
    console.log(url.parse(req.get('origin')).host);
    console.log(url.parse(req.get('origin')));
    const baseurl= req.protocol + '://' + req.headers.host + '/';
    console.log(new URL(req.get('origin'), baseurl));
    const domain= await Domain.findOne({ where: {host: new URL(req.get('origin'), baseurl).host}});
    if(domain) {
        cors({ origin: req.get('origin'), credentials: true })(req, res, next);
    } else next();
});

router.post('/token', apiLimiter, async (req, res) => {
    const { clientSecret }= req.body; //await axios.post(`${URL}/token`, { clientSecret: process.env.CLIENT_SECRET})
    try {
        const domain= await Domain.findOne({
            where: { clientSecret },
            include:{
                model: User,
                attributes: ['nick', 'id']
            },
        });
        if(!domain) {
            return res.status(401).json({
                code: 401,
                message: '도메인 등록 안함'
            });
        }
        const token= jwt.sign({
            id: domain.User.id,
            nick: domain.User.nick
        }, process.env.JWT_SECRET, { expiresIn: '30m', issuer: 'nodebird'});
        return res.json({
            code: 200,
            message: '토큰 발급됨',
            token,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ code: 500, message: '서버 에러'});
    }
});

router.get('/posts/my', apiLimiter, verifyToken, (req, res)=>{
    Post.findAll({ where: { userId: req.decoded.id }})
        .then((posts) => {
            console.log(posts);
            res.json({
                code: 200,
                payload: posts
            });
        })
        .catch((err)=>{
            console.error(err);
            return res.status(500).json({
                code: 500,
                message: '서버 에러'
            });
        });
});

router.get('/posts/hashtag/:title', apiLimiter, verifyToken, async (req, res)=>{
    try {
        console.log('v1 call');
        const hashtag= await Hashtag.findOne({ where: { title: req.params.title }});
        if(!hashtag) 
            return res.status(404).json({ code: 404, message: '검색 결과 없음'});
        const posts= await hashtag.getPosts();
        return res.json({ code: 200, payload: posts });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ code: 500, message:'서버 에러'});
    }
});

router.get('/test', verifyToken, apiLimiter, (req, res) => {
    return res.json(req.decoded);
});


module.exports= router;