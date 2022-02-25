const mongoose= require('mongoose');
const { MONGO_ID, MONGO_PASSWORD, NODE_ENV }= process.env;
const MONGO_URL= `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@localhost:27017/admin`;

const connect= () => {
    if(NODE_ENV !== 'production') mongoose.set('debug', true); 
    //디비의 모든 동작을 콘솔에 출력함

    mongoose.connect(MONGO_URL, {
        dbName: 'gifchat',
        //useNewUrlParser: true, 몽고디비/몽구스 버전이 올라가서 해당 옵션을 넣으면 버그가 발생합니다. 지우시는 게 맞습니다.
        //useCreateIndex: true
    }, (error)=>{
        if(error) console.log('몽고디비 연결 에러');
        else console.log('몽고디비 연결 성공');
    });
};

mongoose.connection.on('error', (error)=>console.error('몽고디비 에러', error));
mongoose.connection.on('disconnected', ()=>{ console.log('연결이 끊김'); connect(); });

module.exports= connect;