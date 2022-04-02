const express= require('express');
const { isLogin }= require('./middlewares');
const {User}=require('../models');
const router= express.Router();

router.post('/:userid/updateNick', isLogin, async (req, res, next)=>{
    try {
        const user= await User.findOne({ where: { id: req.params.userid }});
        if(user) {
            await User.update({ nick: req.body.nick }, { where: { id: req.params.userid }});
            return res.json({ code: 200, message:'잘 변경됨'});
        } else {
            return res.json({ code: 500, message:'해당되는 유저 없음'});
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
});


router.post('/:userid/updatePassword', isLogin, async (req, res, next)=>{
    try {
        const user= await User.findOne({ where: { id: req.params.userid }});
        if(user) {
            await User.update({ password: req.body.password }, { where: { id: req.params.userid }});
            return res.json({ code: 200, message:'잘 변경됨'});
        } else {
            return res.json({ code: 500, message:'해당되는 유저 없음'});
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports= router;