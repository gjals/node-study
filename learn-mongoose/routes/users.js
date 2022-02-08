const express= require('express');
const User= require('../schemas/user');
const Comment= require('../schemas/comment');
const router= express.Router();

router.get('/', async (req, res, next)=>{
    try {
        const user= await User.find({});
        res.json(user);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/', async (req, res, next)=>{
    try {
        const user= await User.create({
            name: req.body.name,
            age: req.body.age,
            married: req.body.married,
        });
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        next(err);
    }
});
//req.body req.params 차이? => /:id/ 이 파라미터에 있는 걸 불러올 때 req.params 쓰고 전달한 객체의 key-value로 불러올 때 req.body 쓰는 듯
router.get('/:id/comments', async (req, res, next)=>{
    try {
        const comments= await Comment.find({commenter: req.params.id}).populate('commenter');
        res.json(comments);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports= router;