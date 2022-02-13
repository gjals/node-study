const passport= require('passport');
const KakaoStrategy= require('passport-kakao').Strategy;
const User= require('../models/user');
//http://www.passportjs.org/packages/passport-kakao/ 참고
module.exports= () => {
    passport.use(new KakaoStrategy({
        clientID: process.env.KAKAO_ID, //.env 파일에 설정?
        callbackURL: '/auth/kakao/callback',  //콜백 링크가 왜이래? oauth 안써?
    }, async (accessToken, refreshToken, profile, done) => { //profile에 사용자 정보를 줌
        try {
            console.log('kakaostrategy까지 옴');
            const exUser= await User.findOne({ where: { snsId: profile.id, emailProvider: 'kakao' }});
            if(exUser) {
                console.log('exuser 이미 있음');
                console.log(JSON.stringify(profile._json));
                done(null, exUser);
            } else {
                const newUser= await User.create({
                    //차이점은 AND 연산자가 첫 번째 falsy를 반환하는 반면, OR은 첫 번째 truthy를 반환한다는 것입니다.
                    email: (profile._json && profile._json.kakao_account_mail) || 'example@naver.com',
                    /**{"id":2117344019,"connected_at":"2022-02-12T10:36:15Z","properties":{"nickname":"허민"},"kakao_account":{"profile_nickname_needs_agreement":false,"profile":{"nickname":"허민"},"has_email":true,"email_needs_agreement":false,"is_email_valid":true,"is_email_verified":true,"email":"hhuurr1004@naver.com"}} */
                    //
                    nick: profile.displayName || 'exampleNick', //어디서 온 속성? 이런 속성 존재?
                    snsId: profile.id,
                    emailProvider: 'kakao', //profile.provider 가능?
                });
                done(null, newUser);
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
}