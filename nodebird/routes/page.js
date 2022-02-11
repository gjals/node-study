const express= require('express');
const router= express.Router();
const { isLogin, isNotLogin }= require('./middlewares');
router.use((req, res, next) => {
    res.locals.user= req.user;
    res.locals.follwerCount= 0;
    res.locals.follwingCount= 0;
    res.locals.follwerIdList= [];
    next();
});

router.get('/profile', isLogin, (req, res) => {
    res.render('profile');
});

router.get('/join', isNotLogin, (req, res) => {
    res.render('join');
});

router.get('/', (req, res, next) => {
    const posts= [];
    res.render('main', { posts });
});

module.exports= router;