//Oldschool JS
var oldschool = [];
for(var i = 0; i < users.length; i++){
    if(users[i].age > 40){
        oldschool.push({
            bla: users[i].name,
            bla2: 'Ok ' + users[i].age,
            bla3: users[i].favMovie  
        })
    }
}
oldschool.sort(function(a,b){
    return a.bla3 > b.bla3 ? 1 : -1
})


//Modern JS
const modern = users.reduce((acc,item) => {
    if(item.age > 40){
        acc.push({
            bla: item.name,
            bla2: `Ok ${item.age}`,
            bla3: item.favMovie  
        })
    }
    return acc
},[]).sort((a,b) => {
    return a.bla3 > b.bla3 ? 1 : -1
})


// JsSql
const jssql = JsSql.run({users},`
    SELECT 
        name AS bla,
        'Ok ' || age AS bla2,
        favMovie AS bla3
    FROM users 
    WHERE 
        age > 40
    ORDER BY bla3 
`);


console.log(oldschool, modern, jssql);