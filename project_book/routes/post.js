const express= require('express');
const { Post, Book, User }= require('../models');
const { isLogin }= require('./middlewares');
const router= express.Router();
const convert = require('xml-js');
const request = require('request');
const Op = require('sequelize').Op; 

router.post('/:id/newPost', isLogin, async (req, res, next)=>{
    try {
        const { title,free_text,bookid }= req.body;
        if(!title || !free_text || !bookid)
            return res.json({ code: 404, message: `${title} ${free_text} ${bookid} post 등록 데이터가 없는 게 있음`});
        const post= await Post.create({
            title,
            free_text,
            UserId: req.params.id,
            BookId: bookid
        });
        return res.json({ code: 200, message:'등록됨'});
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'등록 중 서버 에러'});
    }
})

router.post('/:postid/update', isLogin, async (req, res, next)=>{
    try {
        console.log("update 도착");
        const post= await Post.update({
            title: req.body.title,
            free_text: req.body.free_text,
        }, { where: { id: req.params.postid }});
        return res.json({ code: 200, message:'잘 수정됨' });
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'수정 중 서버 에러'});
    }
})

router.post('/:postid/remove', isLogin, async (req, res, next)=>{
    try {
        const post= await Post.destroy({ where: { id: req.params.postid }});
        return res.json({ code: 200, message:'잘 삭제됨' });
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'삭제 중 서버 에러'});
    }
})

router.post('/genre', async (req, res, next)=>{
    try {
        const { genre }= req.body;
        console.log('장르 배열', genre);
        const posts= await Post.findAll({ include: { model: Book, where: { kdc_code: { [Op.in] : [genre] }} }, order:[[ 'createdAt', 'DESC']] });
        return res.render('main', { posts });
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'검색 중 서버 에러'});
    }
})

router.post('/search', async (req, res, next)=>{
    try {
        const { search_text }= req.body;
        Promise.all([
            await Post.findAll({ include: { model: Book, where: { title: search_text }}}),
            await Post.findAll({ include: { model: Book, where: { author: search_text }}}),
            await Post.findAll({ include: { model: User, where: { nick: search_text }}}),
        ]).then((result)=>{ return res.render('main', { posts: result }); });
        
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'검색 중 서버 에러'});
    }
})
module.exports= router;