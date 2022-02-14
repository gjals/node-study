const express= require('express');
const { isLogin }= require('./middlewares');
const User= require('../models/user');
const router= express.Router();

//axios.post(`/user/${userid}/follow`)
router.post('/:userid/follow', isLogin, async (req, res, next)=>{
    try {
        const user= await User.findOne({ where: { id: req.user.id }});
        if(user) {
            await user.addFollowng(parseInt(req.params.userid, 10));
            res.send('success'); //이게 어디에 나올까?
        } else {
            console.log('not user');
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports= router;