const mongoose= require('mongoose');

const { Schema }= mongoose;
const userSchema= new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    age: {
        type:Number,
        required: true,
    },
    married: {
        type: Boolean,
        required: true,
    },
    Comment: String,
    createdAt: {
        type: Date,
        defaule: Date.now,
    },
});

module.exports= mongoose.model('User', userSchema); //'User'라는 이름의 userSchema를 model로 전달함