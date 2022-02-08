const express= require('express');
const comment = require('../schemas/comment');
const Comment= require('../schemas/comment');
const router= express.Router();

router.post('/', async (req, res, next) => {
    try {
        const comment= await Comment.create({
            commenter: req.body.id,
            comment: req.body.comment,
        });
        const result= await Comment.populate(comment, {path: 'commenter'});
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.patch('/:id', async (req, res, next) => {
    try {
        const result= await Comment.update({_id:req.params.id,}, {comment: req.body.comment,});
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const result= await Comment.remove({_id:req.params.id,});
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports= router;