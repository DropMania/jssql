function JsSql(data, query) {
    let keyWords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET'];
    query = query;
    let keywordArray = query.toUpperCase().match(new RegExp(keyWords.join('|'), 'g'));
    let dataArray = query.split(new RegExp(`${keyWords.join('|')}`, 'g'));
    dataArray.shift();
    let parsedSql = {
        select: '', from: '', where: [], orderBy: ['','ASC'], limit: '', offset: '',
    }
    keywordArray.forEach((keyword, i) => {
        if(keyword === 'SELECT'){
            parsedSql.select = dataArray[i].trim()
        }
        if(keyword === 'FROM'){
            parsedSql.from = dataArray[i].trim()
        }
        if(['WHERE','AND','OR'].includes(keyword)){
            parsedSql.where.push(dataArray[i].trim())
        }
        if(keyword === 'ORDER BY'){
            parsedSql.orderBy[0] = dataArray[i].trim()
        }
        if(keyword === 'ASC' || keyword === 'DESC'){
            parsedSql.orderBy[1] = keyword
        }
        if(keyword === 'LIMIT'){
            parsedSql.limit = dataArray[i].trim()
        }
        if(keyword === 'OFFSET'){
            parsedSql.offset = dataArray[i].trim()
        }
    });
    let table = parsedSql.from;
    let fields = parsedSql.select.split(',');
    if(parsedSql.select === '*'){
        fields = Array.from(data[table].reduce((acc,item) => {
            Object.keys(item).forEach(key => {
                acc.add(key)
            })
            return acc
        }, new Set()));
    }
    let where = parsedSql.where.map(whereItem => {
        let [field, operator, value] = whereItem.split(/\s+/);
        return {field, operator, value}
    });
    let result = []

    result = data[table].filter(item => {
        let isValid = true;
        where.forEach(whereItem => {
            let field = whereItem.field;
            let operator = whereItem.operator;
            let value = whereItem.value.replace(/'|"/g, '');
            if(operator === '='){
                if(item[field] != value){
                    isValid = false;
                }
            }
            if(operator === '!='){
                if(item[field] == value){
                    isValid = false;
                }
            }
            if(operator === '>'){
                if(item[field] <= value){
                    isValid = false;
                }
            }
            if(operator === '<'){
                if(item[field] >= value){
                    isValid = false;
                }
            }
            if(operator === '>='){
                if(item[field] < value){
                    isValid = false;
                }
            }
            if(operator === '<='){
                if(item[field] > value){
                    isValid = false;
                }
            }
            if(operator === 'LIKE'){
                if(!item[field].includes(value)){
                    isValid = false;
                }
            }
        });
        return isValid;
    })
    if(parsedSql.orderBy[0]){
        result.sort((a,b) => {
            if(parsedSql.orderBy[1] === 'ASC'){
                return a[parsedSql.orderBy[0]] - b[parsedSql.orderBy[0]]
            }
            if(parsedSql.orderBy[1] === 'DESC'){
                return b[parsedSql.orderBy[0]] - a[parsedSql.orderBy[0]]
            }
        })
    }
    result = result.reduce((acc, item) => {
        let newItem = {};
        fields.forEach(field => {
            field = field.split('AS')
            if(field[1]){
                newItem[field[1].trim()] = item[field[0].trim()] || '';
            }else{
                newItem[field[0].trim()] = item[field[0].trim()] || '';
            }
        });
        acc.push(newItem);
        return acc;
    }, []);
    if(parsedSql.offset){
        result = result.slice(parsedSql.offset);
    }
    if(parsedSql.limit){
        result = result.slice(0, parsedSql.limit);
    }
    return result;
}

