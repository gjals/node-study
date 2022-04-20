const express= require('express');
const router= express.Router();
const { Post, User, Book }= require('../models')
const { isLogin, isNotLogin }= require('./middlewares');
const db= require('../models/index');

router.use((req, res, next) => {
    res.locals.user= req.user;
    next();
});

router.get('/join', isNotLogin, (req, res) => {
    res.render('join');
});

router.get('/post', isLogin, (req, res)=>{
    console.log('page post까진 옴');
    res.render('post');
});

router.get('/login', isNotLogin, (req, res)=>{
    res.render('login');
});


router.get('/profile', isLogin, async (req, res)=>{
    try {
        const posts= await Post.findAll({ where: { UserId: req.user.id }, include: { model: Book}, order:[[ 'createdAt', 'DESC']]});
        res.render('profile', { posts });
    } catch(err) {
        console.log(err);
        next(err);
    }
})

router.get('/', async (req, res, next) => {
    try {
        const posts= await Post.findAll({
                include: [{
                    model: Book,
                }, {
                    model: User,
                }],
                order:[[ 'createdAt', 'DESC']],
            });
        res.render('main', { posts });
    } catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports= router;