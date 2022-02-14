const express= require('express');
const router= express.Router();
const { Post, User, Hashtag }= require('../models')
const { isLogin, isNotLogin }= require('./middlewares');
router.use((req, res, next) => {
    res.locals.user= req.user;
    res.locals.follwerCount= req.user? req.user.Followers.length : 0;
    res.locals.follwingCount= req.user? req.user.Followings.length : 0;
    res.locals.follwerIdList= req.user? req.user.Followers.map(f=>f.id) : [];
    next();
});

router.get('/profile', isLogin, (req, res) => {
    res.render('profile');
});

router.get('/join', isNotLogin, (req, res) => {
    res.render('join');
});

router.get('/', async (req, res, next) => {
    try {
        const posts= await Post.findAll({
            include: {
                model: User, //그래서 post.User 이렇게 쓰는 건가?
                attributes: ['id', 'nick'],
            },
            order:[[ 'createdAt', 'DESC']],
        });
        res.render('main', { posts });
    } catch (err) {
        console.log(err);
        next(err);
    }
});

router.get('/hashtag', async (req, res, next)=>{
    const query= req.query.post-search-text; //req.query랑 req.body랑 다른 점?
    if(!query) {
        return res.redirect('/');
    }
    try {
        const hashtag= await Hashtag.findOne({ where: { title: query }});
        let posts= [];
        if(hashtag) {
            posts= await hashtag.getPosts({ include: [{ model: User }] });
        }
        return res.render('main', { posts });
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

module.exports= router;