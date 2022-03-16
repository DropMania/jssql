const db = new JsSql()
async function initData(){
    let users = await (await fetch('https://jsonplaceholder.typicode.com/users')).json()
    let posts = await (await fetch('https://jsonplaceholder.typicode.com/posts')).json()
    
    db.add({users,posts})
    console.log(db.run(/*sql*/`
    SELECT posts.title AS postTitle, users.name AS username FROM posts JOIN users ON userId = id
    `))
    drawTable(users,'#source-table')
}
initData()

function keyPress(e){
    if(e.key === 'Enter' && e.ctrlKey){
        runStatement()
    }
}
function runStatement(){
    let statement = document.querySelector('textarea').value
    let table = db.run(statement)
    drawTable(table,'#result-table')
}






function drawTable(data,selector){
    let el = document.querySelector(selector)
    if(!Array.isArray(data)){
        data = [data]
    }
    let cols = Array.from(data.reduce((acc,item) => {
        Object.keys(item).forEach(key => {
            acc.add(key)
        })
        return acc
    }, new Set()));
    let output = `
    <table border='1'>
    <tr>${cols.map(c=>`<th>${c}</th>`).join('\n')}</tr>
    ${data.map(row=>{
        let values = Object.values(row)
        return `<tr>${values.map(v=>{
            if(typeof v === 'object'){
                v = drawTable(v)
            }
            return `<td>${v}</td>`
        }).join('\n')}</tr>`}).join('\n')
    }
    </table>`
    if(selector){
    el.innerHTML = output
    }else{
        return output
    }

}
