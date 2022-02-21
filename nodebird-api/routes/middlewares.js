const jwt= require('jsonwebtoken');
const RateLimit= require('express-rate-limit');

exports.isLogin= (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.send('login go');
    }
}

exports.isNotLogin= (req, res, next) => {
    if(!req.isAuthenticated()) {
        next();
    } else {
        res.send('already login');
    }
}

exports.verifyToken= (req, res, next) => {
    try {
        req.decoded= jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        return next();
    } catch (err) {
        if(err.name === 'TokenExpiredError') 
            return res.status(419).json({
                code: 419,
                message: '토큰이 만료됨'
            });
        return res.status(401).json({
            code: 401,
            message: '유효하지 않은 토큰임',
        });
    }
};

exports.apiLimiter= RateLimit({
    windowMS: 60*1000,
    max: 10,
    handler(req, res) {
        res.status(this.statusCode).json({ code: this.statusCode, message:'1분에 한 번만 요청 가능'});
    }
});

exports.deprecated= (req, res) => {
    console.log('middleware start');
    res.status(410).json({ code: 410, message:'새로운 버젼이 나옴'});
};