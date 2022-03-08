
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