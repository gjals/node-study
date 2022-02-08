const mongoose= require('mongoose');

const connect= () => {
    if(process.env.NODE_ENV !== 'production') {
        mongoose.set('debug', true);
    }
    mongoose.connect('mongodb://min:2610@localhost:27017/admin', { //보안 무슨일?
        dbName: 'nodejs',
        //useNewUrlParser: true,
        //useCreateIndex: true,
    }, (error) => {
        if(error) {
            console.log('몽고디비 연결 에러', error);
        } else {
            console.log('몽고디비 연결 성공', error);
        }
    });
};

mongoose.connection.on('error', (error) => {
    console.error('몽고디비 연결 에러', error);
});
mongoose.connection.on('disconnected', () => {
    console.error('몽고디비 연결이 끊겼습니다.');
    connect();
});

module.exports= connect;

