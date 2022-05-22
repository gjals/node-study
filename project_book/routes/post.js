const express= require('express');
const { Post, Book, User }= require('../models');
const { isLogin }= require('./middlewares');
const router= express.Router();
const convert = require('xml-js');
const request = require('request');
const Op = require('sequelize').Op; 

router.post('/register', isLogin, async (req, res, next)=>{
    try {
        const { title, free_text, bookid }= req.body;
        if(!title || !free_text || !bookid)
            return res.json({ code: 404, message: '선택한 책이 없거나 제목 또는 내용이 비어 있습니다'});
        const post= await Post.create({
            title,
            free_text,
            UserId: req.user.id,
            BookId: bookid
        });
        return res.json({ code: 200, message:'글이 등록되었습니다'});
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'등록 중 서버 에러가 발생했습니다'});
    }
})

router.post('/update', isLogin, async (req, res, next)=>{
    try {
        const { title, free_text, id }= req.body;
        await Post.update({ title, free_text }, { where: { id }});
        return res.json({ code: 200, message:'잘 수정되었습니다' });
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'수정 중 서버 에러가 발생했습니다'});
    }
})

router.post('/remove', isLogin, async (req, res, next)=>{
    try {
        await Post.destroy({ where: { id: req.body.postid }});
        return res.json({ code: 200, message:'잘 삭제되었습니다' });
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'삭제 중 서버 에러가 발생했습니다'});
    }
})

router.post('/search/genre', async (req, res, next)=>{
    try {
        const { genre }= req.body;
        const posts= await Post.findAll({ include: [{ model: Book, where: { kdc_code: { [Op.in] : [genre] }}}, { model: User }] });
        return res.render('main', { posts });
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'검색 중 서버 에러가 발생했습니다'});
    }
})

router.post('/search/text', async (req, res, next)=>{
    try {
        let { search_text }= req.body;
        search_text= await search_text.trim().split(" ");
        const posts= await Post.findAll({
            include: [{ model: Book }, { model: User }],
            where: {
                [Op.or] : [
                    { '$Book.title$': { [Op.substring]: [search_text] } },
                    { '$Book.author$': { [Op.substring]: [search_text] } },
                    { '$User.nick$': { [Op.substring]: [search_text] } }
                ]
            },
            order: [[ 'createdAt', 'DESC']]
        });
        return res.render('main', { posts });
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'검색 중 서버 에러가 발생했습니다'});
    }
})

router.get('/search/mypost', isLogin, async (req, res, next)=>{
    try {
        const posts= await Post.findAll({ where: { UserId: req.user.id }, include: [{ model: Book }, { model: User }], order:[[ 'createdAt', 'DESC']]});
        return res.render('main', { posts });
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'검색 중 서버 에러가 발생했습니다'});
    }
})

module.exports= router;


