const db = new JsSql()
async function initData(){
    let res = await fetch('https://jsonplaceholder.typicode.com/users')
    let users = await res.json()
    db.add({users})
    drawTable(users,'#source-table')
}
initData()

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
