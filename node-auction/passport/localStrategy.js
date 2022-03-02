const passport= require('passport');
const LocalStrategy= require('passport-local').Strategy;
const bcrypt= require('bcrypt');
const User= require('../models/user');

module.exports= () => {
    passport.use(new LocalStrategy({ usernameField: 'login_email', passwordField: 'login_password'}, async (email, password, done)=>{
        try {
            const exUser= await User.findOne({ where: { email }});
            if(exUser) {
                const result= await bcrypt.compare(password, exUser.password);
                if(result) done(null, exUser);
                else done(null, false, '비번불일치');
            } else done(null, false, '노가입');
        } catch (err) { console.error(err); done(err); }
    }));
};

//일반적인 경우 하나의 브라우저에서는 세션을 공유하므로 아무리 새창에서 로그인을 한다고 한들 가장 마지막에 로그인된 세션이 유지된다.
