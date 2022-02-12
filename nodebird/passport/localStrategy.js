const passport= require('passport');
const LocalStrategy= require('passport-local').Strategy;
const bcrypt= require('bcrypt');
const User= require('../models/user');
//http://www.passportjs.org/packages/passport-local/ 참고
module.exports= () => { 
    passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, async (email, password, done) => {
        try {
            const exUser= await User.findOne({ where: {email: email}});
            //(authError, user, info), ${info.message}
            if(exUser) {
                const result= await bcrypt.compare(password, exUser.password);
                if(result) {
                    done(null, exUser);
                } else {
                    done(null, false, {message: '비밀번호가 일치하지 않습니다.'});
                } //뒤에 인자들을 생략 가능, undefined로 전달됨 다만 앞에껄 생략하고 뒤에꺼만 줄 수는 없고 뒤에꺼만 가능함.
            } else {
                done(null, false, {message: '아이디를 확인해주세요'});
            }
        } catch (err) {
            console.error(err);
            done(err);
        }
    }))
};
