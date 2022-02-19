const express= require('express');
const { v4: uuidv4 }= require('uuid');
const { User, Domain }= require('../models');
const { isLogin }= require('./middlewares');
const router= express.Router();

router.get('/', async (req, res, next) => {
    try {
        const user= await User.findOne({
            where: { id: req.user && req.user.id || null }, //id에 null을 줘도 될까?
            include: { model:Domain }
        });
        res.render('login', { user, domains: user && user.Domains }); //s가 붙는건가..?
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/domain', isLogin, async (req, res, next) => {
    try {
        await Domain.create({
            UserId: req.user.id,
            host: req.body.domain_host,
            type: req.body.domain_type,
            clientSecret: uuidv4()
        });
        res.redirect('/');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports= router;