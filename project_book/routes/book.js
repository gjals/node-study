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
        const url= "https://www.nl.go.kr/NL/search/openApi/search.do?key=" + process.env.libraryKey + "&apiType=json&pageNum=1&pageSize=5&category=%EB%8F%84%EC%84%9C&kwd=" + text;
        //api type은 json타입으로, 한 쪽, 10개를 가져오고 카테고리는 도서, 검색어는 text를 입력 변수로 줌
        const socket= req.app.get('io').of('/post').to(req.sessionID);
        //새로고침 없이 데이터를 바로바로 띄우기 위해 소켓 사용함
        request.get(url, async (err, res, body) =>{
            if(err) {
                logger.info(`err => ${err}`);
                next(err);
            }
            else {
                if(res.statusCode == 200) {
                    const jsondata= await body;
                    await socket.emit('search_books', jsondata);
                }
            }
        });
        
    } catch (err) {
        next(err);
    }
})

const return_book_img= async function (url) {
    return new Promise(function (resolve, reject) {
        request(url, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(url);
            } else {
                resolve(null);
            }
        });
    });
}

router.post('/search/image', isLogin, async (req, res, next)=>{
    try {
        const { controlno }= req.body;
        const year= await controlno.replace( /[^0-9]/g, "").substr(0, 4);
        const temp_img_url1= await return_book_img("http://cover.nl.go.kr/kolis/" + year + "/" + controlno +  "_thumbnail.jpg");
        const temp_img_url2=  await return_book_img("http://cover.nl.go.kr/kolis/" + year + "/" + controlno +  "01_thumbnail.jpg");
        const imgurl= await (temp_img_url1 || temp_img_url2 || process.env.default_img_url);
        return res.json({ code: 200, imgurl });
    } catch (err) {
        logger.info(err);
        return res.json({ code: 500, message:'서버 에러'});
    }
})

module.exports= router;