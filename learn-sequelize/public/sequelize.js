document.querySelectorAll('#user-list tr').forEach((el)=>{ 
    el.addEventListener('click', function() {
        const id= el.querySelector('td').textContent;
        getComment(id);
    });
});

async function getComment(id) {
    try {
        const res= await axios.get(`/users/${id}/comments`); 
        const comments= res.data; //res.json또는 res.send 등으로 데이터가 오는데 보낸 형식 그대로 오나?
        const tbody= document.querySelector('#comment-list tbody');
        tbody.innerHTML= '';
        comments.map(function (comment) { //comments 객체 하나하나 돌면서 comment로 사용
            const row= document.createElement('tr');

            let td= document.createElement('td');
            td.textContent= comment.id; 
            row.appendChild(td);

            td= document.createElement('td'); //왜 또 생성? 걍 textContent만 바꾸면 안되나? 한 번 해보기
            td.textContent= comment.User.name;
            row.appendChild(td);

            td= document.createElement('td');
            td.textContent= comment.comment; 
            row.appendChild(td);

            const edit= document.createElement('button');
            edit.textContent= '수정';
            edit.addEventListener('click', async () => {
                const newComment= prompt('바꿀 내용을 입력하세요');
                if(!newComment) { //null이면, 비어있어도 되나? 확인해보기
                    return alert('내용을 반드시 입력하셔야 합니다');
                }
                try {
                    await axios.patch(`/comments/${comment.id}`, { comment: newComment }); //객체로 수정? 왜 객체로 이렇게 해주나?
                    getComment(id); //다시 호출해서 다시 로딩하는 듯
                } catch (err) {
                    console.error(err);
                }
            });

        })

    }
    catch (err) {
        console.log(err);
    }
}