exports.isLogin= (req, res, next)=>{
    if(req.isAuthenticated()) next();
    else res.redirect('/?loginError=로그인필요');
}

exports.isNotLogin= (req, res, next)=>{
    if(!req.isAuthenticated()) next();
    else res.redirect('/');
}