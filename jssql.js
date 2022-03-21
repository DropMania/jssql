class JsSql {
    static #getData(row, field) {
        let q = field.split('.');
        for (let i = 0; i < q.length; i++) {
            if (row[q[i]]) {
                row = row[q[i]];
            } else {
                return null;
            }
        }
        return row;
    }
    static #eval(fieldValue,operator, value) {
        switch (operator) {
            case '=':
                return fieldValue == value;
            case '!=':
                return fieldValue != value;
            case '>':
                return fieldValue > value;
            case '<':
                return fieldValue < value;
            case '>=':
                return fieldValue >= value;
            case '<=':
                return fieldValue <= value;
            case 'LIKE':
                let parts = value.split('%');
                parts = parts.map((part) => {
                    return part.replace(/_/g, '.?');
                });
                let regex = new RegExp(parts.join('.*'));
                if (!regex.test(fieldValue)) {
                    return false;
                }
                return true;
            case 'IN':
                return value.includes(fieldValue);
            case 'NOT IN':
                return !value.includes(fieldValue);
            case 'CONTAINS':
                return fieldValue.includes(value);
            case 'NOT CONTAINS':
                return !fieldValue.includes(value);
            default:
                throw new Error(`Unknown operator: ${operator}`);
        }
    }

    static #checkRow(row, where){
        let left, right;
        if(where.left.type === 'column_ref'){
            left = this.#getData(row,where.left.column)
        }else if(where.left.type === 'binary_expr'){
            left = this.#checkRow(row,where.left)
        }else{
            left = where.left.value
        }
        if(where.right.type === 'column_ref'){
            right = this.#getData(row,where.right.column)
        }else if(where.right.type === 'binary_expr'){
            right = this.#checkRow(row,where.right)
        }else{
            right = where.right.value
        }
        return this.#eval(left,where.operator,right)

    }
    static run(db, query, config = {}) {
        let { keepEmptyCells = true } = config;
        const parser = new NodeSQLParser.Parser()
        const ast = parser.parse(query).ast
        let table = ast.from[0].table;
        let data = db[table];
        /* if (parsedSql.join) {
            data = data.map((row) => {
                return { [table]: row };
            });

            let [joinTable, joinCond] = parsedSql.join
                .split('ON')
                .map((s) => s.trim());
            let joinTableData = db[joinTable];
            let joinCondArray = joinCond
                .split('=')
                .map((c) => c.trim());
            data.forEach((row) => {
                let leftRow = row[table];
                let left = JsSql.#getData(leftRow, joinCondArray[0]);
                if (left) {
                    let right = joinTableData.find((r) => {
                        return r[joinCondArray[1]] === left;
                    });
                    if (right) {
                        row[joinTable] = right;
                    }
                }
            });
        } */
        let fields = ast.columns === '*' ? '*' : ast.columns.map((c) => c.expr.column);
        if (ast.columns === '*' ) {
            fields = Array.from(
                data.reduce((acc, item) => {
                    Object.keys(item).forEach((key) => {
                        acc.add(key);
                    });
                    return acc;
                }, new Set())
            );
        }
 
        let result = [];
        console.log(ast.where)
        result = data.filter((item) => {
            return JsSql.#checkRow(item, ast.where);
        });
        result = result.map((r,i)=>({rownum:i+1,...r}));
        result = result.reduce((acc, item) => {
            let newItem = {};
            fields.forEach((field) => {
                let fields = field
                    .split('AS')
                    .map((item) => item.trim());
                let as = (fields[1] || field).trim();
                let concat = fields[0]
                    .split('||')
                    .map((item) => item.trim());
                if (concat.length > 1) {
                    newItem[as] = concat.reduce((acc, val) => {
                        if (val.match(/'|"/)) {
                            return acc + val.replace(/'|"/g, '');
                        } else {
                            return (
                                acc + JsSql.#getData(item, val) || ''
                            );
                        }
                    }, '');
                } else {
                    if (concat[0].match(/'|"/)) {
                        newItem[as] = concat[0].replace(/'|"/g, '');
                    } else {
                        newItem[as] =
                            JsSql.#getData(item, concat[0]) || '';
                        if (!keepEmptyCells && newItem[as] === '') {
                            delete newItem[as];
                        }
                    }
                }
            });
            acc.push(newItem);
            return acc;
        }, []);
        if (ast.orderby) {
            result.sort((a, b) => {
                if (ast.orderby[0].type === 'ASC') {
                    return JsSql.#getData(a, ast.orderby[0].expr.column) >
                        JsSql.#getData(b, ast.orderby[0].expr.column)
                        ? 1
                        : -1;
                }
                if (ast.orderby[0].type  === 'DESC') {
                    return JsSql.#getData(a, ast.orderby[0].expr.column) >
                        JsSql.#getData(b, ast.orderby[0].expr.column)
                        ? -1
                        : 1;
                }
            });
        }
        /* if (parsedSql.offset) {
            result = result.slice(parsedSql.offset);
        } */
        if (ast.limit) {
            result = result.slice(0, ast.limit.value[0].value);
        }
        console.log(result);
        return result;
          
    }
    run(query, config = {}) {
        return JsSql.run(this.data, query, config);
    }
    constructor(db = {}) {
        this.data = db;
    }
    add(tableName, data) {
        if (typeof tableName === 'string') {
            this.data[tableName] = data;
        } else if (typeof tableName === 'object') {
            Object.keys(tableName).forEach((key) => {
                this.data[key] = tableName[key];
            });
        }
    }
    get(tableName = '') {
        if (tableName) {
            return this.data[tableName];
        } else {
            return this.data;
        }
    }
}
