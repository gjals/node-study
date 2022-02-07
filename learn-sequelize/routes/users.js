const express= require('express');
const User= require('../models/user');
const Comment= require('../models/comment')
const router= express.Router();

router.route('/')
    .get(async (req, res, next) => {
        try {
            console.log('routes/user get 호출됨');
            const users= await User.findAll();
            res.json(users);
        }
        catch (err) {
            console.error(err);
            next(err);
        }
    })
    .post(async (req, res, next) => {
        try { //axios.post('/users', {name, age, married}); 처럼 옴
            console.log('routes/user post호출됨'); 
            const user= await User.create({
                name: req.body.name,
                age: req.body.age,
                married: req.body.married,
            });
            //console.log(user);
            res.status(201).json(user);
        } catch (err) {
            console.error(err);
            next(err); //next 왜 씀?
        }
    });

router.get('/:id/comments', async (req, res, next) => { //:id 로 변수로 표현가능. 이 변수는 req.params.id로 조회할 수 있음.
    try {
        const comments= await Comment.findAll({
            include: {
                model: User,
                where: {id: req.params.id }, 
            },
        });
        //console.log(comments);
        res.json(comments);
    } catch (err) {
        console.error(err);
        next(err); 
    }
});

module.exports= router;