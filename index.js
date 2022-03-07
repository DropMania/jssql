const users = [
    { id: 1, name: 'moe', age: 40, favMovie: 1, hobbies: ['reading', 'writing'], address: { street: '111 main st', city: 'New York', state: 'NY',near_schools: ['school 1', 'school 2'] } },
    { id: 2, name: 'curly', age: 50, favMovie: 2, hobbies: ['reading', 'writing'], address: { street: '222 main st', city: 'New York', state: 'NY',near_schools: ['school 5', 'school 8'] } },
    { id: 3, name: 'larry', age: 60, favMovie: 3, hobbies: ['reading', 'writing'], address: { street: '333 main st', city: 'New York', state: 'NY',near_schools: ['school 3', 'school 2'] } },
    { id: 4, name: 'shep', age: 57, favMovie: 1, hobbies: ['reading'], address: { street: '444 main st', city: 'New York', state: 'NY',near_schools: ['school 46', 'school 4'] } },
    { id: 5, name: 'groucho', age: 45, favMovie: 2, hobbies: ['reading', 'writing'], address: { street: '555 main st', city: 'New York', state: 'NY',near_schools: ['school 3', 'school 8'] } },
    { id: 6, name: 'harpo', age: 64, favMovie: 1, hobbies: ['reading', 'writing'], address: { street: '666 main st', city: 'New York', state: 'NY',near_schools: ['school 6', 'school 4'] } },
    { id: 7, name: 'shep Jr.', age: 5, favMovie: 1, hobbies: ['reading', 'writing'], address: { street: '777 main st', city: 'New York', state: 'NY',near_schools: ['school 7', 'school 9'] } },
]
const db = new JsSql({users})


function runStatement(){
    let statement = document.querySelector('textarea').value
    let table = db.run(statement)
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
    <tr>${cols.map(c=>`<th>${c}</th>`).join('\n')}</tr>
    ${data.map(row=>{
        let values = Object.values(row)
        return `<tr>${values.map(v=>`<td>${JSON.stringify(v)}</td>`).join('\n')}</tr>`}).join('\n')
    }
    </table>`
    el.innerHTML = output
}
