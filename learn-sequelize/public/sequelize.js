const e = require("express");

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

            const edit= document.createElement('button'); //수정버튼 
            edit.textContent= '수정';
            edit.addEventListener('click', async () => {
                const newComment= prompt('바꿀 내용을 입력하세요');
                if(!newComment) { //null이면, 비어있어도 되나? 확인해보기
                    return alert('내용을 반드시 입력하셔야 합니다');
                }
                try {
                    await axios.patch(`/comments/${comment.id}`, { comment: newComment }); //객체로 수정? 왜 객체로 이렇게 해주나?
                    getComment(id); //다시 호출해서 다시 로딩하는 건가? 무한루프에 빠지지 않을까?
                    //이렇게 함수를 호출하면 이 함수는 다른 함수가 끝날 때까지 기다리려나?
                    //return getComment(id) 써야하지 않을까,,?
                } catch (err) {
                    console.error(err);
                }
            });

            const remove= document.createElement('button'); //삭제, 위의 수정과 거의 동일
            edit.textContent= '삭제';
            edit.addEventListener('click', async () => {
                try {
                    await axios.delete(`/comments/${comment.id}`);
                    getComment(id);
                } catch (err) {
                    console.err(err);
                }
            });

            td= document.createElement('td');
            td.appendChild(edit);
            row.appendChild(td);

            td= document.createElement('td');
            td.appendChild(remove);
            row.appendChild(td);
            tbody.appendChild(row);
        });
    }
    catch (err) {
        console.log(err);
    }
}

document.getElementById('user-form').addEventListener('submit', async (e)=> {
    e.preventDefault;
    const name= e.target.username.value; //왜 .target을 하는지 왜 .value를 하는지 checked를 하는지. 보낸 함수 살피기
    const age= e.target.age.value; // -> target은 이벤트가 발생한 대상 객체를 가리킵니다.
    const married= e.target.married.checked; //그냥 {name:username.value, age.., married..}= e.target; 안되나?

    if(!name) {
        return alert('이름을 입력하세요'); //그냥 이대로 함수 종료
    }
    if(!age) {
        return alert('나이를 입력하세요');
    }
    try {
        await axios.post('/users', {name, age, married} );
        getUser();
    }
    catch (err) {
        console.error(err);
    }

    e.target.username.value= '';
    e.target.age.value= '';
    e.target.married.checked= false;
})

document.getElementById('comment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id= e.target.userid.value;
    const comment= e.target.comment.value;
    if(!id) {
        return alert('아이디를 입력하세요');
    }
    if(!comment) {
        return alert('댓글을 입력하세요');
    }
    try {
        axios.post('/comments', {id, comment});
        getComment();
    }
    catch (err) {
        console.error(err);
    }

    e.target.userid.value= ''; //다시 리셋
    e.target.comment.value= '';
})