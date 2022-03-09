const express= require('express');
const { isLogin }= require('./middlewares');
const {User}=require('../models');
const router= express.Router();

router.post('/update', isLogin, async (req, res, next)=>{
    try {
        const user= await User.findOne({ where: { id: req.user.id }});
        if(user) {
            await User.update({ nick: req.body.update_nick_text }, { where: { id: req.user.id }});
            res.redirect('/profile');
        } else {
            console.log('not user');
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports= router;