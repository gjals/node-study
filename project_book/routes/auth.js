const express= require('express');
const passport= require('passport');
const bcrypt= require('bcrypt');
const { isLogin, isNotLogin }= require('./middlewares');
const User= require('../models/user');
const router= express.Router();

router.post('/join', isNotLogin, async (req, res, next) => {
    const { join_email: email, join_nick: nick, join_password:password }= req.body;
    try {
        console.log('auth post에 잘 도착');
        const diUser= await User.findOne({ where: {email: email}});
        if(diUser) {
            //return;
            console.log(diUser);
            return res.redirect('/join?error=exist');
        }
        const hash= await bcrypt.hash(password, 12);
        console.log(hash);
        await User.create({
            email: email,
            nick: nick,
            password: hash,
        });
        return res.redirect('/');

    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.post('/login', isNotLogin, (req, res, next) => {
    console.log('auth/login 도착');
    passport.authenticate('local', (authError, user, info) => { 
        if(authError) {
            console.error(authError);
            return next(authError);
        }
        if(!user) {
            return res.redirect(`/login/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => { //뒤에 콜백은 error가 있을 때 실행되는 콜백인가?
            if(loginError) {
                return next(loginError); 
            }
            console.log('login 되고 리다이렉트만 되면 됨!');
            return res.redirect('/');
        });
    })(req, res, next); //즉시 실행 아님
    //const passportMiddleware = passport.authenticate("local", authFn);
    //passportMiddleware(req, res, next);
});

router.get('/kakao', (req, res, next )=>{console.log('카카오 get 호출됨'); next();}, passport.authenticate('kakao'));

router.get('/kakao/callback', (req, res, next )=>{console.log('카카오 callback 호출됨'); next();}, passport.authenticate('kakao', {
    failureRedirect: '/',
}), (req, res) => { console.log('kakao callback 끝'); res.redirect('/');});


router.get('/logout', isLogin, (req, res, next) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

module.exports= router;

