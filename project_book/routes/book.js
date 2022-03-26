const express= require('express');
const { Post, Book }= require('../models');
const { isLogin }= require('./middlewares');
const router= express.Router();
const convert = require('xml-js');
const request = require('request');

router.post('/admin/:isbn/:kdc', isLogin, async (req, res, next) => {
    try {   
        const { isbn, kdc }= req.params;
        let { title, author, img }= req.body;
        console.log('admin 도착', isbn);
        if(!title || !author || !kdc || !isbn)
            return res.json({ code: 404, message: `${req.body.title} ${req.body.author} ${req.body.kdc} ${req.body.isbn} 책 데이터가 없는 게 있어서 등록 안 됨`});
        //console.log(title, author, kdc, isbn);
        img= (img || "http://localhost:8080/public/iconBook.png");
        await Book.findOrCreate({
            where: { isbn: isbn },
            defaults: { title, author, kdc_code: kdc, title_url: img }
        });
        const book1= await Book.findOne({ where: { isbn }});
        console.log('admin 책 제목', book1.title);
        return res.json({ code: 200, payload: book1 });
    } catch(err) {
        console.log('admin 실패', err);
        next(err);
    }
})

router.post('/search', isLogin, async (req, res, next)=>{
    try {
        const text= encodeURIComponent(req.body.search_text);
        const url= "https://www.nl.go.kr/NL/search/openApi/search.do?key=" + process.env.libraryKey + "&apiType=xml&pageNum=1&pageSize=20&category=%EB%8F%84%EC%84%9C&kwd=" + text;
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
                    //console.log('json data', xmlToJson);
                    await post.emit('searchBooks', xmlToJson);
                }
            }
        });
        
    } catch (err) {
        //next(err);
    }
})

router.post('/image/:isbn', isLogin, async (req, res, next)=>{
    try {
        const { year, viewkey, controlno }= req.body;
        const isbn= req.params.isbn;
        
        const url= "https://seoji.nl.go.kr/landingPage/SearchApi.do?cert_key=" + process.env.libraryKey + "&page_size=10&result_style=xml&page_no=1&ebook=y&isbn=" + isbn;
        //console.log(url);
        let img1, img2, img3;
        
        const img1_promise= new Promise((resolve, reject) => {
            request.get(url, async (err, res, body)=>{
                if(err) {
                    console.log(err);
                    reject();
                } else {
                    if(res.statusCode==200) {
                        const xml= body;
                        const xmlToJson= await convert.xml2json(xml, {compact: true, spaces: 2});
                        const json= await JSON.parse(xmlToJson);
                        if(json.o.docs.e && json.o.docs.e.TITLE_URL) {
                            resolve(json.o.docs.e.TITLE_URL._text);
                        }
                        else reject();
                    }
                    else reject();
                }
            });
        }).catch((error) => {
            return error;
        });
        
        const img2_promise= new Promise((resolve, reject)=>{
            if(year && controlno) {
                const img2_url=  "http://cover.nl.go.kr/kolis/" + year + "/" + controlno +  "_thumbnail.jpg";
                console.log(img2_url);
                request.get(img2_url, async (err, res, body)=> {
                    if(!err && res.statusCode==200) {
                        resolve(img2_url);
                    } else reject();
                });
            } else reject();
        }).catch((error) => {
            return error;
        });

        const img3_promise= new Promise((resolve, reject)=>{
            if(year && controlno) {
                const img3_url=  "http://cover.nl.go.kr/kolis/" + year + "/" + controlno +  "01_thumbnail.jpg";
                console.log(img3_url);
                request.get(img3_url, async (err, res, body)=> {
                    if(!err && res.statusCode==200) {
                        resolve(img3_url);
                    } else { console.log('거절 코드:', err); reject(); }
                });
            } else reject();
        }).catch((error) => {
            return error;
        });

        try{
            img1_promise.then(async (text1)=>{
                img1= await text1;
                img2_promise.then(async (text2)=>{
                    img2= await text2;
                    img3_promise.then(async (text3)=>{
                        img3= await text3;
                        const img_url= await (img2 || img3 || img1 || "http://localhost:8080/public/iconBook.png");
                        console.log('이미지 최종 url',img2, img1,  img_url);
                        return res.json({ code: 200, imgurl: img_url });
                    }).catch(()=>{return res.json({ code: 200, imgurl: img_url });})
                }).catch(()=>{return res.json({ code: 200, imgurl: img_url });})
            }).catch(()=>{return res.json({ code: 200, imgurl: img_url });})
        } catch (err) {
            return res.json({code: 404});
        }
        
        
    } catch (err) {
        console.log(err);
        return res.json({ code: 500, message:'서버 에러'});
    }
})

module.exports= router;