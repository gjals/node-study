const express= require('express');
const passport= require('passport');
const bcrypt= require('bcrypt');
const { isLogin, isNotLogin }= require('./middlewares');
const User= require('../models/user');
const router= express.Router();

router.post('/join', isNotLogin, async (req, res, next) => {
    const { join_email: email, join_nick: nick, join_password:password }= req.body;
    try {
        const diUser= User.findOne({ where: {email: email}});
        if(diUser) {
            return;
            //return res.redirect('/join?error=exist');
        }
        const hash= await bcrypt.hash(password, 12);
        await User.create({
            email: email,
            nick,
            password: hash,
        });
        return res.redirect('/');
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.post('/login', isNotLogin, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => { // user info 인수들은 어떻게 정해진거지?
        if(authError) {
            console.error(authError);
            return next(authError);
        }
        if(!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => { //뒤에 콜백은 error가 있을 때 실행되는 콜백인가?
            if(loginError) {
                return next(loginError); 
            }
            return res.redirect('/');
        });
    })(req, res, next); //즉시 실행 느낌
    //const passportMiddleware = passport.authenticate("local", authFn);
    //passportMiddleware(req, res, next);
});
//req.login logout 이 메소드는 뭘까,,,
router.post('/logout', isLogin, (req, res, next) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

module.exports= router;

