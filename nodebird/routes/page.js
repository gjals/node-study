const express= require('express');
const router= express.Router();
const { Post, User, Hashtag }= require('../models')
const { isLogin, isNotLogin }= require('./middlewares');
const db= require('../models/index');
const { hash } = require('bcrypt');

router.use((req, res, next) => {
    res.locals.user= req.user;
    res.locals.followerCount= req.user? req.user.Followers.length : 0;
    res.locals.followingCount= req.user? req.user.Followings.length : 0;
    res.locals.followerIDList= req.user? req.user.Followings.map(f=>f.id) : [];
    next();
});

router.get('/profile', isLogin, (req, res) => {
    res.render('profile');
});

router.get('/join', isNotLogin, (req, res) => {
    console.log('join get됨');
    res.render('join');
    console.log('join get end');
});

router.get('/', async (req, res, next) => {
    try {
        //const UserPost= db.sequelize.models.UserPost;
        const posts= await Post.findAll({
            include: {
                model: User, //그래서 post.User 이렇게 쓰는 건가?
                attributes: ['id', 'nick'],
            },
            order:[[ 'createdAt', 'DESC']],
        });
        //const good_users= await posts.map(post=>post.getUsers());
        //console.log(good_users);

        console.log('get / render before');
        res.render('main', { posts });
        console.log('get / render end!');
    } catch (err) {
        console.log(err);
        next(err);
    }
});

router.get('/hashtag', async (req, res, next)=>{
    console.log('hashtag get start');
    const query= req.query.post_search_text; //req.query랑 req.body랑 다른 점?
    if(!query) {
        return res.redirect('/');
    }
    try {
        const hashtag= await Hashtag.findOne({ where: { title: query }});
        let posts= [];
        if(hashtag) {
            posts= await hashtag.getPosts({ include: [{ model: User }] });
        }
        console.log('hashtag get end!');
        return res.render('main', { posts });
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

module.exports= router;