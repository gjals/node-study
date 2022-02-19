const express= require('express');
const axios= require('axios');
const router= express.Router();
router.get('/test', async (req, res, next)=>{
    try {
        if(!req.session.jwt) {
            const tokenResult= await axios.post('http://localhost:8002/v1/token', {
                clientSecret: process.env.CLIENT_SECRET,
            });
            if(tokenResult.data && tokenResult.data.code===200)  //return res.json({code: 200, message: '토큰 발급됨',token,});
                req.session.jwt= tokenResult.data.token;
            else
                return res.json(tokenResult.data);
        }
        const result= await axios.get('http://localhost:8002/v1/test', {headers: {authorization: req.session.jwt}});
        //verifyToken, (req, res) => { return res.json(req.decoded); });
        return res.json(result.data);
    } catch (err) {
        console.error(err);
        if(err.responce.status===419)
            return res.json(err.responce.data);
        return next(err);
    }
});

module.exports= router;