const express= require('express');
const { Post }= require('../models');
const { isLogin }= require('./middlewares');
const router= express.Router();
const convert = require('xml-js');
const request = require('request');

router.post('/admin', isLogin, async (req, res, next) => {
    try {   
        const { title, author, kdc, isbn }= req.body;
        console.log(title, author, kdc, isbn);
        const posts= Post.findAll({ where: { isbn } });
    } catch(err) {
        next(err);
    }
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