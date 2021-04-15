import OlapData from './OlapData';

class PivotManager {
    constructor(data, grid, agg, callback) {
        this.data = data;
        this.grid = grid;
        this.version = 0;
        this.caches = {
            cohort: new Map(),
            perms: new Map(),
            recordcache: new Map(),
            dataindexcache: new Map()
        };
        
        if(!this.grid.sort) this.grid.sort = {};
        if(!this.grid.filters) this.grid.filters = {};
        if(!this.grid.page) this.grid.page = {row:0, col:0};
        if(!this.grid.rowsperpage) this.grid.rowsperpage = 1000;
        if(!this.grid.colsperpage) this.grid.colsperpage = 25;
        if(!this.grid.rowsums) this.grid.rowsums = OlapData.SHOWSUM;
        if(!this.grid.colsums) this.grid.colsums = OlapData.SHOWSUM;


        this.agg = agg;
        this.rightopen = true;
        this.callback = callback;
    }

    changeMeasureFormat(measure, newFormat) {
        const {fields, measures} = this.grid;
        const field = fields.filter(f => f.name === measure.name)[0];
        const m = measures.filter(m => m.name === measure.name)[0];

        m.format = newFormat;
        field.format = newFormat;

        this.version++;

        if(this.callback) this.callback(this.version);
    }

    changePage(roworcol, newPage) {
        if(roworcol === OlapData.ROW) this.grid.page.row = newPage;
        if(roworcol === OlapData.COL) this.grid.page.col = newPage;

        this.version++;
        if(this.callback) this.callback(this.version);
    }

    changeSort(key, measure) {
        const sort = this.grid.sort;

        if(key === sort.cohort && measure === sort.measure) {
            this.grid.sort = !sort.desc
                ? {...sort, desc:true}
                : {};
        } else {
            this.grid.sort = {
                roworcol: "row",
                cohort: key,
                measure
            };
        }

        this.version++;
        if(this.callback) this.callback(this.version);
    }

    findDim(roworcol, name) {
        const dim = roworcol === OlapData.ROW
            ? this.grid.rowdims
            : roworcol === OlapData.COL
                ? this.grid.coldims
                : this.grid.measures;

        return dim.map(d => d.name).indexOf(name); 
    }

    getConfigDims(roworcol) {
        const dim = roworcol === OlapData.ROW
            ? this.grid.rowdims
            : roworcol === OlapData.COL
                ? this.grid.coldims
                : this.grid.measures;

        return dim
            .map(d => d.name)
            .map(n => this.grid.fields.filter(f => f.name === n)[0]);

    }

    getSelectedFields() {
        return [
            ...this.grid.rowdims, 
            ...this.grid.coldims, 
            ...this.grid.measures
            ]
            .map(x => x.name);
    }

    moveDim(fieldName, from) {
        let rowdims = this.grid.rowdims;
        let coldims = this.grid.coldims;
        let moved = {};
        const index = this.findDim(from, fieldName);
        
        if (from === OlapData.ROW) {
            moved = this.grid.rowdims.splice(index, 1);
            coldims.push(moved[0]);
        } else {
            moved = this.grid.coldims.splice(index, 1);
            rowdims.push(moved[0]);
        }

        this.resetPage();
        
        this.version++;
        if(this.callback) this.callback(this.version);
    }

    resetPage() {
        this.grid.page = {row:0, col:0};  
    }

    setFilter(dim, selectedItems) {
        this.grid.filters[dim] = selectedItems;
        this.resetPage();
        
        this.version++;
        if(this.callback) this.callback(this.version);
    }

    setPerPage(roworcol, newPerPage) {
        if (roworcol === OlapData.ROW) this.grid.rowsperpage = newPerPage;
        if (roworcol === OlapData.COL) this.grid.colsperpage = newPerPage;
        this.resetPage();
        
        this.version++;
        if(this.callback) this.callback(this.version);   
    }

    setShowTotals(roworcol, show) {
        if(roworcol === OlapData.ROW) this.grid.rowsums = show;
        if(roworcol === OlapData.COL) this.grid.colsums = show;
        this.resetPage();
        
        this.version++;
        if(this.callback) this.callback(this.version);
    }

    swapDims(roworcol, index1, index2) {
        let dims = [];

        if (roworcol === OlapData.ROW) dims = this.grid.rowdims;
        if (roworcol === OlapData.COL) dims = this.grid.coldims;
        if (roworcol === OlapData.MES) dims = this.grid.measures;

        let temp = dims[index1];
        dims[index1] = dims[index2];
        dims[index2] = temp;

        this.resetPage();
        
        this.version++;
        if(this.callback) this.callback(this.version);
    }

    toggleField(name) {
        const selectedfields = this.getSelectedFields();
        let rowdims = this.grid.rowdims;
        let coldims = this.grid.coldims;
        let measures = this.grid.measures;

        const index = selectedfields.indexOf(name);
        const field = this.grid.fields.filter(f => f.name === name)[0];

        if (index > -1) {
            selectedfields.splice(index, 1);
            this.grid.rowdims = rowdims.filter(d => d.name !== name);
            this.grid.coldims = coldims.filter(d => d.name !== name);
            this.grid.measures = measures.filter(d => d.name !== name);

        } else {
            switch (field.defaultPos) {
                case "row":
                case "r":
                    rowdims.push(field);
                    break;
                case "col":
                case "column":
                case "c":
                    coldims.push(field);
                    break;
                case "meas":
                case "measure":
                case "m":
                    measures.push(field);
                    break;
                default:
                    return "";
            }
        }

        this.resetPage();
        
        this.version++;
        if(this.callback) this.callback(this.version);
    }

}

export default PivotManager;