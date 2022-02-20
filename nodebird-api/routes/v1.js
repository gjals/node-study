const express= require('express');
const jwt= require('jsonwebtoken');
const { verifyToken }= require('./middlewares');
const { Domain, User, Post, Hashtag }= require('../models');
const router= express.Router();

router.post('/token', async (req, res) => {
    const { clientSecret }= req.body; //어디서 받아온거지?
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
        }, process.env.JWT_SECRET, { expiresIn: '1m', issuer: 'nodebird'});
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

router.get('/posts/my', verifyToken, (req, res)=>{
    Post.findAll({ where: { UserId: req.decoded.id }})
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

router.get('/posts/hashtag/:title', verifyToken, async (req, res)=>{
    try {
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

router.get('/test', verifyToken, (req, res) => {
    return res.json(req.decoded);
});

module.exports= router;