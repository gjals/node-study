const express= require('express');
const { Post }= require('../models');
const { isLogin }= require('./middlewares');
const router= express.Router();


router.post('/', isLogin, async (req, res, next) => {
    //try {
    //     console.log(req.body.url);
    //     console.log(req.body.post_image_url);
    //     console.log(req.body.post_text);
    //     const post= await Post.create({
    //         content: req.body.post_text,
    //         img: req.body.post_image_url,
    //         UserId: req.user.id, // req.user은 어디서 온거지??
    //     });
        
    //     const hashtags= req.body.post_text.match(/#[^\s#]+/g);
    //     if(hashtags) {
    //         const result= await Promise.all(//왜 굳이 프로미스를 쓰지?
    //             hashtags.map(tag => {
    //                 return Hashtag.findOrCreate({
    //                     where: { title: tag.slice(1).toLowerCase() },
    //                 })
    //             }),
    //         );
    //         await post.addHashtags(result.map(r=>r[0]));
    //     }
    //     console.log('/post end');
    //     res.redirect('/');
    // } catch (err) {
    //     console.error(err);
    //     next(err);
    // }
})

module.exports= router;