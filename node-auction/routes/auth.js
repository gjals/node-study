const express= require('express');
const passport= require('passport');
const bcrypt= require('bcrypt');
const { isLogin, isNotLogin }= require('./middlewares');
const User= require('../models/user');
const router= express.Router();

router.post('/join', isNotLogin, async(req, res, next)=>{
    const { join_email: email, join_password: password, join_nick: nick, join_money: money }= req.body;
    try {
        const exUser= await User.findOne({ where: { email }});
        if(exUser) return res.redirect('/join?joinError=이미가입된이메일');

        const hash= await bcrypt.hash(password, 12);
        await User.create({ email, nick, password:hash, money });
        return res.redirect('/');
    } catch (err) { console.error(err); return next(err); }
});

router.post('/login', isNotLogin, (req, res, next)=>{
    passport.authenticate('local', (authError, user, info)=>{
        if(authError) { console.error(authError); return next(authError); }
        if(!user) { return res.redirect(`/?loginError=${info.message}`); }

        return req.login(user, (loginError)=>{ if(loginError) { console.error(loginError); return next(loginError);} return res.redirect('/'); });
    })(req, res, next);
});

router.get('/logout', isLogin, (req, res)=>{
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

module.exports= router;