const e= require('express');

document.getElementById('new-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await axios.post('/comment', 'post to comment message');
        console.log(res);
    }
    catch (err) {
        console.error(err);
    }
});

document.getElementById('new-form').addEventListener('submit2', async (e) => {
    e.preventDefault();
    try {
        const res= await axios.get('/comment');
        console.log(res);
    }
    catch (err) {
        console.error(err);
    }
});