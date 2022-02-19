const express= require('express');
const jwt= require('jsonwebtoken');
const { verifyToken }= require('./middlewares');
const { Domain, User }= require('../models');
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

router.get('/test', verifyToken, (req, res) => {
    return res.json(req.decoded);
});

module.exports= router;