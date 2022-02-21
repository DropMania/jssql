

const users = [
    { id: 1, name: 'moe', age: 40, favMovie: 1 },
    { id: 2, name: 'curly', age: 50, favMovie: 2 },
    { id: 3, name: 'larry', age: 60, favMovie: 3, a: 2 },
    { id: 4, name: 'shep', age: 57, favMovie: 1 },
    { id: 5, name: 'groucho', age: 45, favMovie: 2 },
    { id: 6, name: 'harpo', age: 64, favMovie: 1 },
    { id: 7, name: 'shep Jr.', age: 5, favMovie: 1 },
]

console.log(JsSql({users}, `
    SELECT 
        *
    FROM users 
    WHERE 
        age > 40
    ORDER BY age ASC
`));
function runStatement(){
    let statement = document.querySelector('textarea').value
    let table = JsSql({users},statement)
    drawTable(table,'#result-table')
}
drawTable(users,'#source-table')





function drawTable(data,selector){
    let el = document.querySelector(selector)
    let cols = Array.from(data.reduce((acc,item) => {
        Object.keys(item).forEach(key => {
            acc.add(key)
        })
        return acc
    }, new Set()));
    let output = `
    <h1>users</h1>
    <table border='1'>
    <tr>
        ${cols.map(c=>`<th>${c}</th>
        `).join('')}
    </tr>
    ${data.map(row=>{
        let values = Object.values(row)
        return `
        <tr>
            ${values.map(v=>`<td>${v}</td>
            `).join('')}
        </tr>
        `
    }).join('')}
    </table>
    `
    el.innerHTML = output
}