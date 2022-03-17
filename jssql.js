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
    static run(db, query, config = {}) {
        let { keepEmptyCells = true } = config;
        let keyWords = [
            'SELECT ',
            ' FROM ',
            ' WHERE ',
            ' AND ',
            ' OR ',
            ' ORDER BY ',
            ' ASC',
            ' DESC',
            ' LIMIT ',
            ' OFFSET ',

            ' GROUP BY ',
            ' HAVING ',
            ' JOIN '
        ];
        return query
            .split('UNION')
            .map((q) => {
                let keywordArray = q
                    .toUpperCase()
                    .match(new RegExp(keyWords.join('|'), 'g'));
                let dataArray = q.split(
                    new RegExp(`${keyWords.join('|')}`, 'g')
                );
                dataArray.shift();
                let parsedSql = {
                    select: '',
                    from: '',
                    where: [],
                    orderBy: ['', 'ASC'],
                    limit: '',
                    offset: '',
                    join: ''
                };
                keywordArray.forEach((keyword, i) => {
                    keyword = keyword.trim();
                    if (keyword === 'SELECT') {
                        parsedSql.select = dataArray[i].trim();
                    }
                    if (keyword === 'FROM') {
                        parsedSql.from = dataArray[i].trim();
                    }
                    if (['WHERE', 'AND', 'OR'].includes(keyword)) {
                        parsedSql.where.push(dataArray[i].trim());
                    }
                    if (keyword === 'ORDER BY') {
                        parsedSql.orderBy[0] = dataArray[i].trim();
                    }
                    if (keyword === 'ASC' || keyword === 'DESC') {
                        parsedSql.orderBy[1] = keyword;
                    }
                    if (keyword === 'LIMIT') {
                        parsedSql.limit = dataArray[i].trim();
                    }
                    if (keyword === 'OFFSET') {
                        parsedSql.offset = dataArray[i].trim();
                    }
                    if (keyword === 'GROUP BY') {
                        parsedSql.groupBy = dataArray[i].trim();
                    }
                    if (keyword === 'JOIN') {
                        parsedSql.join = dataArray[i].trim();
                    }
                });
                let table = parsedSql.from;
                let data = db[table];
                if (parsedSql.join) {
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
                }
                let fields = parsedSql.select.split(',');
                if (parsedSql.select === '*') {
                    fields = Array.from(
                        data.reduce((acc, item) => {
                            Object.keys(item).forEach((key) => {
                                acc.add(key);
                            });
                            return acc;
                        }, new Set())
                    );
                }

                let where = parsedSql.where.map((whereItem) => {
                    let [field, operator, ...value] = whereItem.split(/\s+/);
                    return { field, operator, value: value.join(' ') };
                });
                let result = [];

                result = data.filter((item) => {
                    let isValid = true;
                    where.forEach((whereItem) => {
                        let field = whereItem.field;
                        let operator = whereItem.operator;
                        let value = whereItem.value.trim();
                        if (value.match(/'|".*'|"/)) {
                            value = value.replace(/'|"/g, '');
                        } else if (value.match(/\d+/)) {
                            value = parseInt(value);
                        } else {
                            value = JsSql.#getData(item, value);
                        }
                        let fieldValue = JsSql.#getData(item, field);
                        if (operator === '=') {
                            if (fieldValue != value) {
                                isValid = false;
                            }
                        }
                        if (operator === '!=') {
                            if (fieldValue == value) {
                                isValid = false;
                            }
                        }
                        if (operator === '>') {
                            if (fieldValue <= value) {
                                isValid = false;
                            }
                        }
                        if (operator === '<') {
                            if (fieldValue >= value) {
                                isValid = false;
                            }
                        }
                        if (operator === '>=') {
                            if (fieldValue < value) {
                                isValid = false;
                            }
                        }
                        if (operator === '<=') {
                            if (fieldValue > value) {
                                isValid = false;
                            }
                        }
                        if (operator === 'LIKE') {
                            let parts = value.split('%');
                            parts = parts.map((part) => {
                                return part.replace(/_/g, '.?');
                            });
                            let regex = new RegExp(parts.join('.*'));
                            if (!regex.test(fieldValue)) {
                                isValid = false;
                            }
                        }
                        if (operator === 'NOT LIKE') {
                            let parts = value.split('%');
                            parts = parts.map((part) => {
                                return part.replace(/_/g, '.?');
                            });
                            let regex = new RegExp(parts.join('.*'));
                            if (regex.test(fieldValue)) {
                                isValid = false;
                            }
                        }
                        if (operator === 'IN') {
                            if (!value.split(',').includes(fieldValue)) {
                                isValid = false;
                            }
                        }
                        if (operator === 'NOT IN') {
                            if (value.split(',').includes(fieldValue)) {
                                isValid = false;
                            }
                        }
                        if (operator === 'CONTAINS') {
                            if (!fieldValue.includes(value)) {
                                isValid = false;
                            }
                        }
                        if (operator === 'NOT CONTAINS') {
                            if (fieldValue.includes(value)) {
                                isValid = false;
                            }
                        }
                    });
                    return isValid;
                });
                result.forEach((r,i)=>{r.rownum = i+1});
                console.log(result);
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
                if (parsedSql.orderBy[0]) {
                    result.sort((a, b) => {
                        if (parsedSql.orderBy[1] === 'ASC') {
                            return JsSql.#getData(a, parsedSql.orderBy[0]) >
                                JsSql.#getData(b, parsedSql.orderBy[0])
                                ? 1
                                : -1;
                        }
                        if (parsedSql.orderBy[1] === 'DESC') {
                            return JsSql.#getData(a, parsedSql.orderBy[0]) >
                                JsSql.#getData(b, parsedSql.orderBy[0])
                                ? -1
                                : 1;
                        }
                    });
                }
                if (parsedSql.offset) {
                    result = result.slice(parsedSql.offset);
                }
                if (parsedSql.limit) {
                    result = result.slice(0, parsedSql.limit);
                }
                return result;
            })
            .flat();
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
