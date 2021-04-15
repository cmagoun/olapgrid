import * as Utils from './Utils';
import moment from 'moment';

class OlapData {
    static ROW = "row";
    static COL = "col";
    static MES = "meas";
    static SHOWSUM = "show";
    static NOSUM = "none";
    static ISSUM = "ZZZ___";
    static NOPAGING = undefined;

    constructor(useProfiling) {
        this.dataindex = new Map();
        this.keyIndex = new Map();
    
        this.caches = {};

        this.rowdims = [];
        this.coldims = [];

        this.records = [];
        this.measures = [];

        this.rowsums = [];
        this.colsums = [];

        this.rowview = [];
        this.colview = [];

        this.rowpages = [];
        this.colpages = [];

        this.useProfiling = useProfiling;
    }

    //entry point
    static create(data, grid, agg, caches, useProfiling) {
        const olap = new OlapData(useProfiling);
        olap.run(data, grid, agg, caches);
        return olap;
    }

    run(data, grid, agg, caches) {
        if(this.useProfiling) {
            console.log("");
            console.log("start run " + data.length + " recs");
            console.log("----------");
        }

        this.caches = caches || {};
        this.rowdims = grid.rowdims || [];
        this.coldims = grid.coldims || [];

        this.measures = grid.measures || [];
        this.rowsums = grid.rowsums || OlapData.SHOWSUM;
        this.colsums = grid.colsums || OlapData.SHOWSUM;

        this.filters = grid.filters || {};
        this.sort = grid.sort || {};
        this.agg = agg;

        this.rowsperpage = grid.rowsperpage || 0;
        this.colsperpage = grid.colsperpage || 0;

        this.allRecords = data.slice();

        let records = [];
        const cacheKey = this.__createCacheKey(); 

        this.__filterTransform(data, this.filters);

        if( this.caches.recordcache &&
            this.caches.recordcache.has(cacheKey)) {
                records = this.caches.recordcache.get(cacheKey);
                this.dataindex = this.caches.dataindexcache.get(cacheKey);
        } else {
            records = this.__filterRecords(data.slice(), this.filters);
            records = this.__prepRecords(records, this.rowdims, this.coldims, this.measures, agg.prep);
            records = this.__assignDataKeys(records);
            const sums = this.__createAllAssociations(records);
            records = this.__reduceAssociations(sums, agg.sum);
            records = this.__postCalculations(records, this.rowdims, this.coldims, this.measures, agg.post);
            this.__createDataIndex(records);
    
            if(this.caches.recordcache) this.caches.recordcache.set(cacheKey, records);
            if(this.caches.dataindexcache) this.caches.dataindexcache.set(cacheKey, this.dataindex);
        }

        records = this.__createSortKeys(records);

        this.rowview = this.__dimensionView(records, this.rowdims, "row", this.sort);
        this.colview = this.__dimensionView(records, this.coldims, "col", this.sort);
        this.rowpages = this.__dimensionPages(records, this.rowview, this.rowsperpage);
        this.colpages = this.__dimensionPages(records, this.colview, this.colsperpage);
      

        this.records = records;
        this.page = grid.page || {row:0, col:0};
        this.rowpage = this.page.row || 0;
        this.colpage = this.page.col || 0;

        if(this.useProfiling) {
            console.log("----------");
            console.log("end run");
            console.log("");
        }
        
        return this;
    }


    //methods __ means it is meant to be private
    __anyNonNull = (arr) => {
        let result = false;
        arr.forEach(a => {
            if (a !== null) result = true;
        });

        return result;
    }

    //for each record assign a rowkey, colkey and datakey
    //for a record with name = bob, dept = science, city = new york
    //and rowdims = dept, city; coldims = name
    //rowkey = science | new york
    //colkey = bob
    //datakey = science | new york | bob
    __assignDataKeys(records) {
        return records.map(record => {
            let rowKey = "";
            let colKey = "";

            this.rowdims.forEach((dim, i) => {
                rowKey += this.__getKeyPart(dim, record);
                if (i < this.rowdims.length - 1) rowKey += "|";
            });

            this.coldims.forEach((dim, i) => {
                colKey += this.__getKeyPart(dim, record);
                if (i < this.coldims.length - 1) colKey += "|";
            });

            record.rowKey = rowKey;
            record.colKey = colKey;
            record.dataKey = Utils.createKey(rowKey, colKey);

            return record;
        });
    }


    __createAllAssociations(records) {
        const sums = new Map();

        records.forEach(r => {
            this.__createAssociations(r, sums);
        });

        return sums;
    }

    __createAssociations(record, sums) {
        let rowKeyArray = this.__getKeyPermutations(record.rowKey);
        let colKeyArray = this.__getKeyPermutations(record.colKey);

        if (this.rowsums !== OlapData.SHOWSUM) rowKeyArray = [rowKeyArray[0]];
        if (this.colsums !== OlapData.SHOWSUM) colKeyArray = [colKeyArray[0]];

        //for all possible permutations of the datakey of this record...
        rowKeyArray.forEach(rk => {
            colKeyArray.forEach(ck => {
                const finalKey = Utils.createKey(rk, ck);           
                let arr = sums.get(finalKey);

                if(arr === undefined) {
                    const templateRecord = this.__createSumRecord(record, rk, ck, finalKey); 
                    sums.set(finalKey, [templateRecord, record]);
                } else {
                    arr.push(record);
                    sums.set(finalKey, arr);
                }
            })
        });
    }

    __createCacheKey() {
        const allFields =  [...this.rowdims, ...this.coldims, ...this.measures];
        const postKey = allFields.some(r => r.requiresPost);
        const preKey = allFields.some(r => r.requiresPrep);

        const rowKey = this.rowdims.map(d => d.name).join("|");
        const colKey = this.coldims.map(d => d.name).join("|");

        const filterKey = JSON.stringify(this.filters);

        return `${rowKey}/${colKey}/${filterKey}/${this.rowsums}/${this.colsums}/${postKey}/${preKey}`;
    }

    __createDataIndex(records) {
        records.forEach(r => {
            this.dataindex.set(r.dataKey, r);
        });
    }

    __createSortKeys(records) {
        const roworcol = this.sort.roworcol;

        return records.map(r => {
            r.sortkey = this.__createSortKey(r, roworcol, this.sort);
            return r;
        });
    }

    __createBlankSortKey(record, roworcol) {
        const newKeyArray = [];
        const keyArray = roworcol === "row"
            ? record.rowKey.split("|")
            : record.colKey.split("|");

        keyArray.forEach(k => {
            newKeyArray.push(0);
            newKeyArray.push(k);
        });

        return newKeyArray.join("|");
    }

    //a sortkey is similar to a datakey, but intersperses measure values
    //along with the dimension values to allow the records to be sorted
    //in an arbitrary order
    //so for the record with datakey = science | new york | bob
    //and an ascending sort on score
    //the sort key might be 16 | science | 1012 | new york | 1600 | bob
    __createSortKey(record, roworcol, sort) {
        if(roworcol === undefined) return "";

        const dims = roworcol === "row"
            ? this.rowdims
            : this.coldims;

        let keyArray = [];
        dims.forEach((d,i) => {
            const ck = this.__getSortKeyBasedOnCohort(record, i+1, dims.length, roworcol, sort.cohort);
            
            const dataRec = this.getRecord(ck);

            const val = record[d.name] !== OlapData.ISSUM
                ? dataRec !== undefined
                    ? this.getRecord(ck)[sort.measure.name]
                    : 0
                : sort.desc
                    ? Number.MAX_VALUE * -1
                    : Number.MAX_VALUE;

            keyArray.push(val);
            keyArray.push(record[d.name]);
        });

        return keyArray.join("|");

    }

    __createSumRecord(record, rowKey, colKey, dataKey) {
        const newRec = Object.assign({}, record, { rowKey, colKey, dataKey });
        this.__prepareSumRecord(this.rowdims, rowKey.split("|"), newRec);
        this.__prepareSumRecord(this.coldims, colKey.split("|"), newRec);
        return newRec;
    }

    __prepareSumRecord(dims, vals, result) {
        dims.forEach((dim, i) => {
            if (dim.type !== "") {
                result[dim.name] = this.__getValueForKey(dim, vals[i]);
            } else {
                result[dim.name] = vals[i];
            }
        });
    }

    dimensionLevel(rowcol, level, pagenum) {
        if (level < 0) return [{ value: "", count: 1, key: "" }];       
        const page = this.getDimensionPage(rowcol, pagenum);
        return page.filter(r => r[level] !== null).map(r => r[level]);
    }

    __dimensionView(records, dims, roworcol, sort) {
        //this exists to ease HTML creation by counting records that belong to this
        //cohort, so that row/col spans can be set
        if (!dims || dims.length === 0) return [{ value: "", count: 1, key: "" }];

        const dimKey = roworcol === "row"
            ? "rowKey"
            : "colKey";

        const oldValues = dims.map(dim => { return { count: 0, row: 0, key: "" } }); //each is {value: count: row:}
        const rows = []; //each is {value: count:} or null
        let index = 1;

        rows.push(dims.map(dim => { return { value: "", count: 0 } }));

        const sorted = this.sort && this.sort.roworcol === roworcol
            ? records.slice().filter(r => r.sortkey !== "").sort(Utils.compareBySortKey(sort.desc))
            : records.slice().sort(Utils.compareKey(dimKey));

        sorted.forEach(record => {
            const newRow = [];
            const counts = [];
            let dimKey = "";

            dims.forEach((dim, i) => {
                if (dimKey !== "") dimKey += "|";
                dimKey += this.__getKeyPart(dim, record);

                if (dimKey !== oldValues[i].key) {
                    newRow[i] = { value: record[dim.name], count: 1, key: dimKey, index: rows.length-1 };
                    rows[oldValues[i].row][i].count = oldValues[i].count;
                    oldValues[i] = { count: 1, row: index, key: dimKey };
                } else {
                    newRow[i] = null;
                    if (!this.__leafLevel(i, dims)) counts[i] = true;
                }
            });

            if (this.__anyNonNull(newRow)) {
                counts.forEach((c, i) => {
                    if (c) oldValues[i].count++;
                });

                rows.push(newRow.slice());
                index++;
            }
        });

        //the recordset is ended, but the values didn't change, so last counts are wrong
        dims.forEach((dim, i) => {
            rows[oldValues[i].row][i].count = oldValues[i].count;
        });

        rows.shift();
        return rows;
    }

    __dimensionPages(records, view, perpage) {
        if(perpage === undefined || perpage === 0 || view.length <= perpage) return [];

        const filtered = view.filter(r => r[0] !== null);
        const pages = [];
        let page = {first:null, last:null, count:0};

        filtered.some((r,i) => {
            const item = r[0];
            if(page.first === null) {
                //this is the first item in the new page
                page.first = {value: item.value, index: item.index};
            }

            //add the count to the current page
            page.count += item.count;

            if(page.count >= perpage || i === filtered.length - 1) {
                const previousitem = filtered[i-1] !== undefined
                    ? filtered[i-1][0]
                    : "";

                const lastitem = filtered[i+1] !== undefined && filtered[i+1][0].value === OlapData.ISSUM
                    ? filtered[i+1][0]
                    : item;
  
                page.last = {
                    //even if we are adding the sum to the page, show the last non-sum value
                    value: item.value !== OlapData.ISSUM ? item.value : previousitem.value, 
                    index: lastitem.index + lastitem.count-1
                };

                pages.push({...page});
                page = {first:null, last:null, count:0};

                //break the forEach if this is the final rollup
                return lastitem.value === OlapData.ISSUM;
            }
            return false;
        });

        return pages;
    }

    __eliminateDupes(records, agg) {
        //take all the records with the same datakey, group them
        //and run the provided agg function on them to roll them
        //into a single record

        //1. This eliminates duplicate records in the dataset (for
        //instance if there are fields not in the dimension lists)

        //2. Our summing process actually adds records with duplicate
        //keys into the dataset, so they can later be aggregated by
        //this function
        return agg
            ? Utils.groupByArray(records, "dataKey", agg)
            : records;
    }

    __filter(record, filters) {
        //filter looks like
        //{
        //  Jcode: ['J1234', 'J2345', 'J3456'],
        //  Deptartment: ['BEAVER OHA', 'HILLMAN']
        //}
        //each record must have one of the allowed JCodes AND belong to one of the Depts
        for (let filterName in filters) {
            if (filters.hasOwnProperty(filterName) && filters[filterName] !== undefined) {
                if (!filters[filterName].includes(record[filterName]))
                    return false;
            }
        }

        return true;
    }

    __filterTransform(records, filters) {
        for(let filterName in filters) {
            if(filters.hasOwnProperty(filterName) && filters[filterName] !== undefined) {
                if(filters[filterName] === "FIRST_FIVE") {
                    
                    const arrFilter = [];

                    for(let i = 0; i < records.length; i++) {
                        const r = records[i];
                        if(!arrFilter.includes(r[filterName])) arrFilter.push(r[filterName]);
                        if(arrFilter.length === 5) break;
                    }

                    filters[filterName] = arrFilter;
                }
            }
        }
    }

    __filterRecords(data, filters) {
        if(Utils.isEmpty(filters)) return data;

        const result = [];

        data.forEach(r => {
            if(this.__filter(r, filters)) result.push(r);
        });

        return result;
    }

    getCohortForDimension(record, records, dimension) {
        if(this.caches.cohort &&
            this.caches.cohort.has(this.filterKey + record.dataKey)) return this.caches.cohort.get(this.filterKey + record.dataKey);

        const rowIndex = this.rowdims.map(rd => rd.name).indexOf(dimension);
        const newRowKey = rowIndex > -1
            ? this.__getKeyPermutations(record.rowKey)[this.rowdims.length - rowIndex]
            : record.rowKey;
    
        const colIndex = this.coldims.map(cd => cd.name).indexOf(dimension);
        const newColKey = colIndex > -1
            ? this.__getKeyPermutations(record.colKey)[this.coldims.length - colIndex]
            : record.colKey;
    
        const newKey = newColKey === ""
            ? newRowKey
            : newRowKey === ""
                ? newColKey
                : newRowKey + "|" + newColKey;
        
        const result = records.filter(r => r.dataKey === newKey)[0];
        if(this.caches.cohort) this.caches.cohort.set(this.filterKey + record.dataKey, result);
        return result;
    }

    getDimensionPage(roworcol, pagenum) {
        const view = roworcol === OlapData.ROW
            ? this.rowview
            : this.colview;

        const pages = roworcol === OlapData.ROW
            ? this.rowpages
            : this.colpages;

        if(pagenum === undefined || pages.length === 0) return view;

        const page = pages[pagenum];
        const last = page.last ? page.last.index+1 : page.first.index+1;

        return view.slice(page.first.index, last);
    }

    getRecord(dataKey) {
        return this.dataindex.get(dataKey);
    }
    
    __getKeyPart(dim, record) {
        switch (dim.type) {
            case "month":
                //if we use a month dimension as a key part, return a
                //key part that is correctly sortable
                //jan = 01, feb = 02, march = 03, etc.
                const result = this.__getMonthKeyPart(dim, record);
                this.keyIndex.set(`${dim.name}:${result}`, record[dim.name]);
                return result;
             
            default:
                return record[dim.name] === OlapData.ISSUM
                    ? OlapData.ISSUM
                    : record[dim.name];
        }
    }

    __getKeyPermutations(s) {
        //s is in the form x|y|z
        //you want 
        //x|y|z
        //x|y|_
        //x|_|_
        //_|_|_
        if(s === "") return [""];
        if(this.caches.perms && this.caches.perms.has(s)) return this.caches.perms.get(s);
    
        const result = [s];
        const arr = s.split("|");
        //let newstring = s;
    
        let i = arr.length-1;
        while(i > -1) {
            arr[i] = OlapData.ISSUM;
            result.push(arr.join("|"));
            i--;
        }
    
        if(this.caches.perms) this.caches.perms.set(s, result);
        return result;
    }

    __getMonthKeyPart(dim, record) {
        if(record[dim.name] === OlapData.ISSUM) return OlapData.ISSUM;

        const month = record[dim.name];
        const dt = moment([2000, 0, 1]).month(month);
        return dt.format('MM');
    }

    __getSortKeyBasedOnCohort(record, level, dimcount, rowOrCol, cohort) {
        const newRowKey = rowOrCol === "row"
            ? this.__getKeyPermutations(record.rowKey)[dimcount - level]
            : cohort;
    
        const newColKey = rowOrCol === "col"
            ? this.__getKeyPermutations(record.colKey)[dimcount - level]
            : cohort;
    
        return newColKey === ""
            ? newRowKey
            : newRowKey === ""
                ? newColKey
                : newRowKey + "|" + newColKey;
    }

    __getValueForKey(dim, key) {
        return this.keyIndex.has(`${dim.name}:${key}`)
            ? this.keyIndex.get(`${dim.name}:${key}`)
            : key;
    }

    __leafLevel = (level, dims) => {
        return level === dims.length - 1;
    }

    __prepRecords(records, rowdims, coldims, measures, prep) {
        if(!prep) return records;
        if (![...rowdims, ...coldims, ...measures].some(d => d.requiresPrep)) return records;

        return records.map(record => prep(record, records, this));
    }

    __postCalculations(records, rowdims, coldims, measures, post) {
        if (!post) return records;
        if (![...rowdims, ...coldims, ...measures].some(d => d.requiresPost)) return records;

        return records.map(record => post(record, records, this));
    }

    
    __reduceAssociations(sums, agg) {
        const result = [];

        sums.forEach((v, k) => {
            const template = v.shift();
            const sumRec = agg(v);
            result.push({...template, ...sumRec});   
        });

        return result;

    }

}

export default OlapData;
