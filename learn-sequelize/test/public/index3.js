
document.getElementById('new-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        console.log('index3 submit 실행');
        const mood= e.target.mood.value;
        await axios.post('/mood', { mood: mood });
        await axios.get('/');
        e.target.mood.value= '';
    }
    catch (err) {
        console.error(err);
    }
});


