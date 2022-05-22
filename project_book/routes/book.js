const express= require('express');
const { Post, Book }= require('../models');
const { isLogin }= require('./middlewares');
const router= express.Router();
const convert = require('xml-js');
const logger= require('../logger')
const request = require('request');

router.post('/register', isLogin, async (req, res, next) => {
    try {   
        const { title, author, kdc, img }= req.body;
        if(!title || !author || !kdc)
            return res.json({ code: 404, message: `책의 제목이나 작가, kdc 코드 등 부족한 데이터가 있어서 등록할 수 없습니다`});
        const book= await Book.findOrCreate({
            where: { title, author },
            defaults: { title, author, kdc_code: kdc, title_url: img }
        });
        return res.json({ code: 200, book: book[0], message: '책이 선택되었습니다' });
    } catch(err) {
        console.log(err);
        return res.json({ code:404, message: '책이 제대로 등록되지 못했습니다'});
    }
})

router.post('/search', isLogin, async (req, res, next)=>{
    try {
        const text= encodeURIComponent(req.body.search_text);
        const url= "https://www.nl.go.kr/NL/search/openApi/search.do?key=" + process.env.libraryKey + "&apiType=xml&pageNum=1&pageSize=20&category=%EB%8F%84%EC%84%9C&kwd=" + text;
        const socket= req.app.get('io').of('/post').to(req.sessionID);
        request.get(url, async (err, res, body) =>{
            if(err) {
                logger.info(`err => ${err}`);
                next(err);
            }
            else {
                if(res.statusCode == 200) {
                    const xml= await body;
                    const xmlToJson= await convert.xml2json(xml, {compact: true, spaces: 2});
                    await socket.emit('search_books', xmlToJson);
                }
            }
        });
        
    } catch (err) {
        next(err);
    }
})

router.post('/search/image', isLogin, async (req, res, next)=>{
    try {
        const { isbn, viewkey, controlno }= req.body;
        const year= controlno.replace(regex, "").substr(0, 4);
        let img1_promise;
        if(isbn) {
            const url= "https://seoji.nl.go.kr/landingPage/SearchApi.do?cert_key=" + process.env.libraryKey + "&page_size=10&result_style=xml&page_no=1&isbn=" + isbn;
            console.log(url);
            img1_promise= new Promise((resolve, reject) => {
                request.get(url, async (err, res, body)=>{
                    if(err) {
                        logger.info(err);
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
        }
        
        let img1, img2, img3;

        const img2_promise= new Promise((resolve, reject)=>{
            if(year && controlno) {
                const img2_url=  "http://cover.nl.go.kr/kolis/" + year + "/" + controlno +  "_thumbnail.jpg";
                console.log(img2_url);
                //logger.info(img2_url);
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
                //logger.info(img3_url);
                request.get(img3_url, async (err, res, body)=> {
                    if(!err && res.statusCode==200) {
                        resolve(img3_url);
                    } else { logger.info('거절 코드:', err); reject(); }
                });
            } else reject();
        }).catch((error) => {
            return error;
        });

        try{
            if(isbn) {
                img1_promise.then(async (text1)=>{
                    img1= await text1;
                    img2_promise.then(async (text2)=>{
                        img2= await text2;
                        img3_promise.then(async (text3)=>{
                            img3= await text3;
                            const img_url= await (img2 || img3 || img1 || "http://13.125.37.134:8080/public/iconBook.png");
                            //logger.info('이미지 최종 url',img2, img1,  img_url);
                            return res.json({ code: 200, imgurl: img_url });
                        }).catch(()=>{return res.json({ code: 200, imgurl: img_url });})
                    }).catch(()=>{return res.json({ code: 200, imgurl: img_url });})
                }).catch(()=>{return res.json({ code: 200, imgurl: img_url });})
            } else {
                img2_promise.then(async (text2)=>{
                    img2= await text2;
                    img3_promise.then(async (text3)=>{
                        img3= await text3;
                        const img_url= await (img2 || img3 || "http://13.125.37.134:8080/public/iconBook.png");
                        //logger.info('이미지 최종 url', img_url);
                        return res.json({ code: 200, imgurl: img_url });
                    }).catch(()=>{return res.json({ code: 200, imgurl: img_url });})
                }).catch(()=>{return res.json({ code: 200, imgurl: img_url });})
            }
        } catch (err) {
            return res.json({code: 404});
        }
        
        
    } catch (err) {
        logger.info(err);
        return res.json({ code: 500, message:'서버 에러'});
    }
})



module.exports= router;