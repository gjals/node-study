const express= require('express');
const router= express.Router();

router.use((req, res, next) => {
    res.locals.user= null;
    res.locals.follwerCount= 0;
    res.locals.follwingCount= 0;
    res.locals.follwerIdList= [];
    next();
});

router.get('/profile', (req, res) => {
    res.render('profile');
});

router.get('/join', (req, res) => {
    res.render('join');
});

router.get('/', (req, res, next) => {
    const posts= [];
    res.render('main', { posts });
});

module.exports= router;