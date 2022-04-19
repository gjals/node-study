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
        const posts= await Post.findAll({ include: [{ model: Book, where: { kdc_code: { [Op.in] : [genre] }}}, {model: User}] });
        return res.render('main', { posts });
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'검색 중 서버 에러'});
    }
})

//https://cover.nl.go.kr/kolis/2013/KMO201325311_thumbnail.jpg net::ERR_CERT_DATE_INVALID nl.go.kr 인증서 만료로 이미지가 안뜸
router.post('/search', async (req, res, next)=>{
    try {
        let { search_text }= req.body;
        search_text= search_text.trim().split(" ");
        console.log("search_Text" , search_text);
        
        const set= new Set();
        let search_array1= [];
        search_text.forEach(element => {
            search_array1.push({
                    [Op.or] : [
                        { title: { [Op.substring]: element } },
                        { author: { [Op.substring]: element } }
                    ]
                }
            );
        });
        let search_array2= [];
        search_text.forEach(element => {
            search_array2.push({
                nick: { [Op.substring]: element }
                }
            );
        });
        const posts1= await Post.findAll({ include: [{ model: Book, where: {
            [Op.or] : search_array1
        }}, {model: User}]});
        posts1.forEach(element=> { set.add(element)});
        const posts2= await Post.findAll({ include: [{ model: User, where: {
            [Op.or]: search_array2
        }}, { model: Book}]});
        posts2.forEach(element=> { set.add(element)});
        const posts= Array.from(set);
        console.log('검색된 포스트: ', posts);
        return res.render('main', { posts });
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'검색 중 서버 에러'});
    }
})

router.get('/lookmypost', isLogin, async (req, res, next)=>{
    try {
        const posts= await Post.findAll({ where: { UserId: req.user.id }, include: [{ model: Book}, {model: User}], order:[[ 'createdAt', 'DESC']]});
        return res.render('main', { posts: posts });
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'검색 중 서버 에러'});
    }
})


module.exports= router;


