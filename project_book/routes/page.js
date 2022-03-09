const express= require('express');
const router= express.Router();
const { Post, User, Book }= require('../models')
const { isLogin, isNotLogin }= require('./middlewares');
const db= require('../models/index');

router.use((req, res, next) => {
    res.locals.user= req.user;
    next();
});

router.get('/profile', isLogin, (req, res) => {
    res.render('profile');
});

router.get('/join', isNotLogin, (req, res) => {
    res.render('join');
});

router.get('/login', (req, res=>{
    res.render('login');
}));

router.get('/post', (req, res)=>{
    res.render('login');
});

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
        
        console.log(posts);
        console.log('get / render before');
        res.render('main', { posts });
        console.log('get / render end!');
    } catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports= router;