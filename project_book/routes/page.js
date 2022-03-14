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
        
        console.log('get / render before');
        res.render('main', { posts });
        console.log('get / render end!');
    } catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports= router;