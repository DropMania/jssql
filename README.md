# JsSql
### A simple SQL Compiler for JavaScript collections (Array of Objects)

## e.g.
```javascript
const users = [
    { id: 1, name: 'moe', age: 40, favMovie: 1 },
    { id: 2, name: 'curly', age: 50, favMovie: 2 },
    { id: 3, name: 'larry', age: 60, favMovie: 3, other: 2 },
    { id: 4, name: 'shep', age: 57, favMovie: 1 },
    { id: 5, name: 'groucho', age: 45, favMovie: 2 },
    { id: 6, name: 'harpo', age: 64, favMovie: 1 },
    { id: 7, name: 'shep Jr.', age: 5, favMovie: 1 },
];
const db = new JsSql({users});

const query = `
    SELECT 
        name AS bla,
        'Ok ' || age AS bla2,
        favMovie AS bla3
    FROM users 
    WHERE 
        age > 40
    ORDER BY bla3 
`;
const result = db.run(query);

console.log(result);
/*
log:
0: {bla: 'harpo', bla2: 'Ok 64', bla3: 1}
1: {bla: 'shep', bla2: 'Ok 57', bla3: 1}
2: {bla: 'groucho', bla2: 'Ok 45', bla3: 2}
3: {bla: 'curly', bla2: 'Ok 50', bla3: 2}
4: {bla: 'larry', bla2: 'Ok 60', bla3: 3}
*/
```

# Todo

*   query multiple tables (JOIN and maybe subquerys?)
*   error handling
*   stability
