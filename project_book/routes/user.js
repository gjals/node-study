const express= require('express');
const { isLogin }= require('./middlewares');
const {User}=require('../models');
const router= express.Router();
const bcrypt= require('bcrypt');

router.post('/update/nick', isLogin, async (req, res, next)=>{
    try {
        const user= await User.findOne({ where: { id: req.user.id }});
        if(user) {
            await User.update({ nick: req.body.nick }, { where: { id: req.user.id }});
            return res.json({ code: 200, message:'잘 변경되었습니다'});
        } else {
            return res.json({ code: 500, message:'해당되는 유저를 찾지 못했습니다'});
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
});


router.post('/update/password', isLogin, async (req, res, next)=>{
    try {
        if(bcrypt.compare(req.body.pass_now, req.user.password)==false) 
            return res.json({ code: 500, message:'현재 비밀번호와 다릅니다'});
        if(req.body.password1!==req.body.password2)
            return res.json({ code: 500, message:'비밀번호를 다시 확인해주세요'});

        const user= await User.findOne({ where: { id: req.user.id }});
        const hash= await bcrypt.hash(req.body.password1, 12);
        if(user) {
            await User.update({ password: hash }, { where: { id: req.user.id }});
            return res.json({ code: 200, message:'잘 변경되었습니다'});
        } else {
            return res.json({ code: 500, message:'해당되는 유저를 찾지 못했습니다'});
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports= router;