const jwt= require('jsonwebtoken');

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