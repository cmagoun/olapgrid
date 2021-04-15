import OlapData from "./OlapData";

export const getValueFromKey = (key) => {
    const truncKey = key.slice(-1) === "|" 
        ? key.slice(0,-1)
        : key;
    const arrKey = truncKey.split("|");
    return arrKey.pop();
}

export const createKey = (rk, ck) => {
    return ck === ""
        ? rk
        : rk === ""
            ? ck
            : rk + "|" + ck;
}

export const compareKey = (keyName) => (a, b) => {
    const result = compareAsString(a[keyName], b[keyName]);
    return result;
}

export const compareBySortKey = (desc) => (a, b) => {
    const akey = a.sortkey;
    const bkey = b.sortkey;

    const aarray = akey.split("|");
    const barray = bkey.split("|");

    let i = 0;
    let result = 0;

    while(result === 0 && i < aarray.length) { 
        result = i%2 === 0
            ? compareAsNumber(aarray[i], barray[i])
            : compareAsString(aarray[i], barray[i]);

        i++;
    }

    return desc
        ? result * -1
        : result;
}

const compareAsNumber = (a, b) => {
    return a-b;
}

const compareAsString = (a, b) => {
    if(a === undefined || b===undefined) {
        console.log(a);
        console.log(b);
    }

    if(a.toLowerCase() > b.toLowerCase()) return 1;
    if(b.toLowerCase() > a.toLowerCase()) return -1;
    return 0;
}

export const distinct = (array, prop) => {
    if (array === undefined) return [];
    const values = array.map(i => prop(i));
    return [...new Set(values)];
}

export const getCohortRecord = (record, all, rowOrCol) => {
    const key = getCohortKey(record.rowKey, record.colKey, rowOrCol);
    return all.filter(a => a.dataKey === key)[0];
}

export const getCohortKey = (rowKey, colKey, rowOrCol) => {
    const newRowKey = rowOrCol === "row"
        ? getTotalKey(rowKey)
        : rowKey;

    const newColKey = rowOrCol === "col"
        ? getTotalKey(colKey)
        : colKey;

        return newColKey === ""
        ? newRowKey
        : newRowKey === ""
            ? newColKey
            : newRowKey + "|" + newColKey;
}



export const getSort = (key, measure, sort) => {
    if(key === sort.cohort && measure === sort.measure) {
        return !sort.desc
            ? {...sort, desc:true}
            : {}
    } else {
        return {
            roworcol:"row",
            cohort: key,
            measure
        }
    }
}

export const isEmpty = (map) => {
    for(var key in map) {
        if (map.hasOwnProperty(key)) {
           return false;
        }
      }
      return true;
}

const getTotalKey = (key) => {
    const keyArray = key.split("|");
    keyArray[keyArray.length - 1] = OlapData.ISSUM;
    return keyArray.join("|");
}

export const groupByArray = (array, prop, func) => {
    const grouped = groupBy(array, prop);
    let result = [];

    for(let key in grouped) {
        if(grouped.hasOwnProperty(key)) {
            const newObj = func === undefined
                ? grouped[key][0]
                : func(grouped[key]);

            result.push(newObj);
        }
    }

    return result;
}

export const sum = (func) => (arr) => {
    return arr.reduce((tot, x) => tot + func(x), 0);
}

export const avg = (func) => (arr) => {
    const total = sum(func)(arr);
    return total/arr.length;
}

export const groupBy = (array, prop) => {
    return array.reduce((groups, item) => {

        const val = prop !== undefined
            ? item[prop]
            : item;

        if(val !== undefined) {
            groups[val] = groups[val] || [];
            groups[val].push(item);
        }
        return groups;
    }, {});
}

export const prepareForPost = (map) => {
    //turns map(string, data) into keyvalue pairs for C#
    const result = [];
    map.forEach((value, key, map) => result.push({key, value}));
    return result;
}

export const withProfiling = (useProfiling) => (label, func) => {
    return __wp(useProfiling, label, func);
}

const __wp = (use, label, func) => (...args) => {
    return __profile(use, label, func, args);
}

const __profile = (use, label, func, args) => {
    if(use) console.time(label)
    const result = func(...args);
    if(use) console.timeEnd(label);

    return result;
}



