const express= require('express');
const { Post, Book }= require('../models');
const { isLogin }= require('./middlewares');
const router= express.Router();
const convert = require('xml-js');
const request = require('request');

router.post('/adminBook', isLogin, async (req, res, next) => {
    try {   
        const { title, author, kdc, isbn }= req.body;
        if(title || author || kdc || isbn)
            return res.json({ code: 404, message: `${req.body.title} ${req.body.author} ${req.body.kdc} ${req.body.isbn} 데이터가 없는 게 있어서 등록 안 됨`});
        console.log(title, author, kdc, isbn);
        const book= await Book.findOrCreate({
            where: { _isbn: isbn },
            defaults: { title, author, kdc_code: kdc }
        });
        return res.json({ code: 200, payload: book });
    } catch(err) {
        next(err);
        return res.json({ code: 500, message:'서버 에러'});
    }
})

router.post('/:id/newPost', isLogin, async (req, res, next)=>{
    try {
        const post= await Post.create({
            title: req.body.post_title,
            free_text: req.body.post_free_text,
            UserId: req.params.id,
            BookIsbn: req.body.post_book_isbn
        });
        return res.json({ code: 200, payload: post });
    } catch (err) {
        next(err);
        return res.json({ code: 500, message:'서버 에러'});
    }
})

router.post('/search', isLogin, async (req, res, next)=>{
    try {
        const text= encodeURIComponent(req.body.search_text);
        const url= "https://www.nl.go.kr/NL/search/openApi/search.do?key=" + process.env.libraryKey + "&kwd=" + text;
        console.log(url);
        const post= req.app.get('io').of('/post').to(req.sessionID);
        request.get(url, async (err, res, body) =>{
            if(err) {
                console.log(`err => ${err}`);
                next(err);
            }
            else {
                if(res.statusCode == 200){
                    const xml= body;
                    //console.log(`body data => ${xml}`)
                    const xmlToJson= await convert.xml2json(xml, {compact: true, spaces: 2});
                    console.log('json data', xmlToJson);
                    await post.emit('searchBooks', xmlToJson);
                }
            }
        });
        
    } catch (err) {
        next(err);
    }
})


module.exports= router;