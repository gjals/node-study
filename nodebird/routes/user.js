const express= require('express');
const { isLogin }= require('./middlewares');
const User= require('../models/user');
const router= express.Router();
const db= require('../models/index');

//axios.post(`/user/${userid}/follow`)
router.post('/:id/follow', isLogin, async (req, res, next)=>{
    try {
        console.log('user follow 도착', req.user.id, '가 ', req.params.userid, '를 팔로우함');
        const user= await User.findOne({ where: { id: req.user.id }});
        if(user) {
            console.log('user있음에 들어옴!');
            await user.addFollowing(parseInt(req.params.id, 10));
            res.send('success'); //이게 어디에 나올까?
            console.log('user 렌더끝');
        } else {
            console.log('not user');
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
});

router.post('/:id/unfollow', isLogin, async (req, res, next)=>{
    try {
        console.log('user unfollow에 옴');
        console.log('asdf', req.params.id, 'asdf', req.user.id);
        console.log(parseInt(req.params.id, 10));
        const user= await User.findOne({ where: { id: req.user.id }});
        if(user) {
            const Follow= db.sequelize.models.Follow;
            await Follow.destroy({
                where: {
                    followingId: parseInt(req.params.id, 10),
                    followerId: req.user.id,
                }
            });
            res.send('success');
        } else {
            console.log('not user');
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
});

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

router.post('/good', isLogin, async (req, res, next)=>{
    try {
        const user= await User.findOne({ where: { id: req.user.id }});
        const postid= parseInt(req.body.postid, 10);
        if(user) {
            const UserPost= db.sequelize.models.UserPost;
            const result= await UserPost.findOne({
                where: {
                    UserId: req.user.id,
                    PostId: postid,
                }
            });
            if(result) {
                console.log(req.user.id, req.body.postid, '좋아요 있음');
                await UserPost.destroy({
                    where: {
                        UserId: req.user.id,
                        PostId: postid,
                    }
                });
                res.send('a');
            }
            else { 
                console.log(req.user.id, req.body.postid, '좋아요 없음');
                await UserPost.create({
                    UserId: req.user.id,
                    PostId: postid,
                });
                res.send('a');
            }
        } else {
            console.log('not user');
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
});

router.post('/isgood', isLogin, async (req, res, next)=>{
    try {
        const user= await User.findOne({ where: { id: req.user.id }});
        const postid= parseInt(req.body.postid, 10);
        console.log('isgood start');
        if(user) {
            const UserPost= db.sequelize.models.UserPost;
            const result= await UserPost.findAll({
                where: {
                    PostId: postid,
                    userId: req.user.id,
                }
            });
            if(result.length===0) {
                res.send({isgood: false});
            } else {
                res.send({isgood: true});
            }
        } else {
            console.log('not user');
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
});
module.exports= router;