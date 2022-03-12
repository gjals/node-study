const express= require('express');
const { Post }= require('../models');
const { isLogin }= require('./middlewares');
const router= express.Router();
const convert = require('xml-js');
const request = require('request');

router.post('/newPost', isLogin, async (req, res, next) => {
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



router.post('/search', isLogin, async (req, res, next)=>{
    const text= encodeURIComponent(req.body.text);
    const url= "https://www.nl.go.kr/NL/search/openApi/search.do?key=" + process.env.libraryKey + "&kwd=" + text;
    console.log(url);
    const post= req.app.get('io').of('/post').to(req.sessionID);

    request.get(url, async (err, res, body) =>{
        if(err) {
            console.log(`err => ${err}`)
        }
        else {
            if(res.statusCode == 200){
                const xml= body;
                //console.log(`body data => ${xml}`)
                const xmlToJson = await convert.xml2json(xml, {compact: true, spaces: 4});
                console.log('json data', xmlToJson)
                post.emit('searchBooks', xmlToJson);
            }
    
        }
    })
})
module.exports= router;