const express= require('express');
const { Post, Book }= require('../models');
const { isLogin }= require('./middlewares');
const router= express.Router();
const convert = require('xml-js');
const request = require('request');

router.post('/:id/newPost', isLogin, async (req, res, next)=>{
    try {
        const post= await Post.create({
            title: req.body.post_title,
            free_text: req.body.post_free_text,
            UserId: req.params.id,
            BookId: req.body.post_book_id
        });
        return res.json({ code: 200, payload: post });
    } catch (err) {
        next(err);
        return res.json({ code: 500, message:'서버 에러'});
    }
})



module.exports= router;