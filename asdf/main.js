function solution(m, n, board) {
    var answer = 0;
    let isChange= true;
    let sum= 0;
    for(let i=0; i<m; i++)
        board[i]= board[i].split('');
    
    while(isChange) {
        isChange= false;
        const remove= new Array(m);
        for(let i=0; i<m; i++) remove[i]= new Array(n).fill(false);
        for(let i=0; i<m-1; i++)
            for(let j=0; j<n-1; j++) {
                if(board[i][j]!='X' && board[i][j]==board[i+1][j] && board[i+1][j]==board[i][j+1] && board[i][j+1]==board[i+1][j+1]) {
                    remove[i][j]= remove[i+1][j]= remove[i][j+1]= remove[i+1][j+1]= true;
                }
            }
        
        for(let i=0; i<n; i++) {
            let index= m;
            for(let j=m; j>=0; j--) {
                if(!remove[j][i]) {
                    board[index][i]= board[j][i];
                }
            }
        }
    }
    
    return sum;
}

console.log(solution(6,2, ["AA", "AA", "CC", "AA", "AA", "DD"])) 
