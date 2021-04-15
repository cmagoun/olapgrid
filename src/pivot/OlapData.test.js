import OlapData from './OlapData';
import * as Utils from './Utils';

const noagg = {
    sum: recs => {return recs[0];}
}

const data = [
    {name: "Bob", department: "Sales", month: "Jan", sickdays: 1, expenses: 333.99}, 
    {name: "Bob", department: "Sales", month: "Feb", sickdays: 0, expenses: 280.50}, 
    {name: "Bob", department: "Sales", month: "Mar", sickdays: 0, expenses: 150.00}, 
    {name: "Bob", department: "Sales", month: "Apr", sickdays: 0, expenses: 325.00}, 
    {name: "Bob", department: "Sales", month: "May", sickdays: 3, expenses: 419.99}, 
    {name: "Bob", department: "Sales", month: "Jun", sickdays: 0, expenses: 148.00}, 

    {name: "Carl", department: "Sales", month: "Jan", sickdays: 2, expenses: 234.99}, 
    {name: "Carl", department: "Sales", month: "Feb", sickdays: 5, expenses: 456.50}, 
    {name: "Carl", department: "Sales", month: "Mar", sickdays: 7, expenses: 432.00}, 
    {name: "Carl", department: "Sales", month: "Apr", sickdays: 1, expenses: 122.00}, 
    {name: "Carl", department: "Sales", month: "May", sickdays: 1, expenses: 675.99}, 
    {name: "Carl", department: "Sales", month: "Jun", sickdays: 2, expenses: 456.00}, 

    {name: "Jim", department: "Sales", month: "Jan", sickdays: 0, expenses: 431.31}, 
    {name: "Jim", department: "Sales", month: "Jan", sickdays: 2, expenses: 134.13}, //this record is the 2nd Jan record for Jim
    {name: "Jim", department: "Sales", month: "Feb", sickdays: 0, expenses: 512.00}, 
    {name: "Jim", department: "Sales", month: "Mar", sickdays: 1, expenses: 450.00}, 
    {name: "Jim", department: "Sales", month: "Apr", sickdays: 2, expenses: 479.00}, 
    {name: "Jim", department: "Sales", month: "May", sickdays: 0, expenses: 125.00}, 
    {name: "Jim", department: "Sales", month: "Jun", sickdays: 3, expenses: 612.00}, 
 
    {name: "Randy", department: "Research", month: "Jan", sickdays: 1, expenses: 0}, 
    {name: "Randy", department: "Research", month: "Feb", sickdays: 0, expenses: 2012.00}, 
    {name: "Randy", department: "Research", month: "Mar", sickdays: 0, expenses: 0}, 
    {name: "Randy", department: "Research", month: "Apr", sickdays: 0, expenses: 560.00}, 
    {name: "Randy", department: "Research", month: "May", sickdays: 4, expenses: 0}, 
    {name: "Randy", department: "Research", month: "Jun", sickdays: 1, expenses: 1600.00}, 

    {name: "Sally", department: "Research", month: "Jan", sickdays: 6, expenses: 200.00}, 
    {name: "Sally", department: "Research", month: "Feb", sickdays: 0, expenses: 200.00}, 
    {name: "Sally", department: "Research", month: "Mar", sickdays: 1, expenses: 200.00}, 
    {name: "Sally", department: "Research", month: "Apr", sickdays: 0, expenses: 200.00}, 
    {name: "Sally", department: "Research", month: "May", sickdays: 2, expenses: 200.00}, 
    {name: "Sally", department: "Research", month: "Jun", sickdays: 1, expenses: 200.00}, 

    {name: "Zoe", department: "Research", month: "Jan", sickdays: 1, expenses: 200.00}, 
    {name: "Zoe", department: "Research", month: "Feb", sickdays: 2, expenses: 188.00}, 
    {name: "Zoe", department: "Research", month: "Mar", sickdays: 3, expenses: 133.00}, 
    {name: "Zoe", department: "Research", month: "Apr", sickdays: 4, expenses: 111.00}, 
    {name: "Zoe", department: "Research", month: "May", sickdays: 5, expenses: 100.00}, 
    {name: "Zoe", department: "Research", month: "Jun", sickdays: 6, expenses: 0.00}, 
]

const grid = {
    rowdims: [
        { name: "department", display: "Dept", type:"",total: "All Depts", defaultPos: OlapData.ROW },
        { name: "name", display: "Employee", type:"",total: "All Employees", defaultPos: OlapData.ROW},
        //{ name: "month", display: "Month", type:"month", total: "All Months", defaultPos: OlapData.COL}
    ],
    coldims: [
        { name: "month", display: "Month", type:"month", total: "All Months", defaultPos: OlapData.COL}
    ],
    measures: [
        { name: "sickdays", display: "Sick", type:"month", total: "", defaultPos: OlapData.MES, format: "", requiresPrep: true, reqiresPost: true},
        { name: "expenses", display: "Expenses", type:"", total: "", defaultPos: OlapData.MES, format: "$", requiresPrep: true, requiresPost: true} 
    ],
    fields: [
        { name: "department", display: "Dept", type:"",total: "All Depts", defaultPos: OlapData.ROW },
        { name: "name", display: "Employee", type:"",total: "All Employees", defaultPos: OlapData.ROW},
        { name: "month", display: "Month", type:"month", total: "All Months", defaultPos: OlapData.COL},
        { name: "sickdays", display: "Sick", type:"month", total: "", defaultPos: OlapData.MES, format: "", requiresPrep: true, reqiresPost: true},
        { name: "expenses", display: "Expenses", type:"", total: "", defaultPos: OlapData.MES, format: "$", requiresPrep: true, reqiresPost: true} 
    ],
};

it('can filter records based on filter obj', () => {
    const olap = new OlapData(false);

    const falsey = olap.__filter(
        {name: "Jim", department: "Sales", month: "Jun", sickdays: 3, expenses: 612.00},
        {department: "Research"}
    );
    expect(falsey).toBe(false);

    const truish = olap.__filter(
        {name: "Sally", department: "Research", month: "Jun", sickdays: 1, expenses: 200.00},
        {department: "Research"}
    );
    expect(truish).toBe(true);
});

it('can filter on a more complex object', () => {
    const olap = new OlapData(false);

    const falsey = olap.__filter(
        {name: "Sally", department: "Research", month: "Jun", sickdays: 1, expenses: 200.00},
        {
            department: "Research",
            month: "Jan"
        }
    );
    expect(falsey).toBe(false);

    const truish = olap.__filter(
        {name: "Sally", department: "Research", month: "Jan", sickdays: 6, expenses: 200.00},
        {
            department: "Research",
            month: "Jan"
        }
    );
    expect(truish).toBe(true);

});

it('can get key part for string field', () => {
    const olap = new OlapData(false);
    const result = olap.__getKeyPart(
        { name: "name", display: "Employee", type:"",total: "All Employees", defaultPos: OlapData.ROW},
        { name: "Riley",  month: "Oct" });
    expect(result).toBe("Riley");
});

it('can get key part for month field', () => {
    const olap = new OlapData(false);
    const result = olap.__getKeyPart({name:"month", type:"month"}, {name: "Riley", month: "Oct"});
    expect(result).toBe("10");
});

it('can get the original value from the index when it has created a month key part', () => {
    const olap = new OlapData(false);
    const test = olap.__getKeyPart({name:"month", type:"month"}, {name: "Riley", month: "Oct"});
    const result = olap.__getValueForKey({name:"month", type:"month"}, "10");
    expect(result).toBe("Oct");
});

it('can create appropriate sum associations for a given record', () => {
    const olap = new OlapData(false);

    olap.rowdims = [
        { name: "department", display: "Dept", type:"",total: "All Depts", defaultPos: OlapData.ROW },
        { name: "name", display: "Employee", type:"",total: "All Employees", defaultPos: OlapData.ROW},
        { name:"month", type:"month"}
    ];
    olap.rowsums = OlapData.SHOWSUM;

    let records = olap.__assignDataKeys([data[0]]);
    const sums = olap.__createAllAssociations(records);

    const keys = [];
    const values = [];

    sums.forEach((v,k) => {
        keys.push(k);
        values.push(v);
    });

    expect(keys.length).toBe(4);
    expect(values[1].length).toBe(2); //template object and value object
    expect(keys[0]).toBe("Sales|Bob|01");
    expect(keys[1]).toBe("Sales|Bob|ZZZ___");
    expect(keys[2]).toBe("Sales|ZZZ___|ZZZ___");
    expect(keys[3]).toBe("ZZZ___|ZZZ___|ZZZ___");
});

it('can create sums', () => {  
    const agg = {
        sum: recs => {
            const result = {
                sickdays: Utils.sum(r => r.sickdays)(recs),
                expenses: Utils.sum(r => r.expenses)(recs)        
            };

            return result;
        }

    };

    const od = OlapData.create(data, grid, agg);
    const test = od.getRecord("Research|Zoe|ZZZ___");
    expect(test.sickdays).toBe(21);

    const jan = od.getRecord("ZZZ___|ZZZ___|01");
    expect(jan.sickdays).toBe(13);
});

it('if given a prep function, that function is run for each', () => {
    const agg = {
        sum: recs => {
            const result = {
                sickdays: Utils.sum(r => r.sickdays)(recs),
                expenses: Utils.sum(r => r.expenses)(recs)        
            };

            return result;
        },

        prep: (r, recs, od) => {
            r.plusOne = r.sickdays + 1;
            return r;
        }
    };

    const olap = OlapData.create(data, grid, agg);
    const test = olap.getRecord('Research|Sally|01');

    expect(test.plusOne).toBe(7);
})

it('can assign data keys to records', () => {

    const olap = OlapData.create(data, grid, noagg);

    const bob = olap.records.filter(r => r.name === "Bob" && r.month === "Jan")[0];
    expect(bob.rowKey).toBe("Sales|Bob");
    expect(bob.colKey).toBe("01");
    expect(bob.dataKey).toBe("Sales|Bob|01");

    const sally = olap.records.filter(r => r.name === "Sally" && r.month==="Jun")[0];
    expect(sally.rowKey).toBe("Research|Sally");
    expect(sally.colKey).toBe("06");
    expect(sally.dataKey).toBe("Research|Sally|06");
});

it('can prep records given a function', () => {
    const agg = {
        sum: (recs) => {
            return recs[0];
        },
        prep: (r, all) => {
            r.testField = r.name + "/" + r.department;
            return r;
        }
    }

    const olap = OlapData.create(data, grid, agg);

    const bob = olap.records.filter(r => r.name === "Bob" && r.month === "Jan")[0];
    expect(bob.testField).toBe("Bob/Sales");

    const sally = olap.records.filter(r => r.name === "Sally" && r.month==="Jun")[0];
    expect(sally.testField).toBe("Sally/Research");
});

it('can eliminate dupes given a function', () => {
    const agg = {
        sum: recs => {
            const result = {
                sickdays: Utils.sum(r => r.sickdays)(recs),
                expenses: Utils.sum(r => r.expenses)(recs)        
            };

            return result;
        }
    }

    let olap = new OlapData();
    olap = OlapData.create(data, grid, agg);

    const jim = olap.records.filter(r => r.name === "Jim" && r.month === "Jan")[0];
    //should be sum of the two Jan records for jim
    expect(jim.name).toBe("Jim");
    expect(jim.department).toBe("Sales");
    expect(jim.sickdays).toBe(2);
    expect(jim.expenses).toBe(565.44);
});

it('the filter function works as expected', () => {
    const olap = new OlapData();
    const result = olap.__filterRecords(data, {department:["Sales"], month:["Jan"]});
    
    const test = result.filter(r => r.department !== "Sales");
    expect(test.length).toBe(0);
});

it('correctly excludes filtered records from calculations', () => {
    const agg = {
        sum: recs => {
            const first = recs[0];

            const result = Object.assign({}, first, {
                sickdays: Utils.sum(r => r.sickdays)(recs),
                expenses: Utils.sum(r => r.expenses)(recs)        
            });

            return result;
        }
    }

    const filteredGrid = {...grid, filters: {department:["Sales"], month:["Jan"]}};
    const olap = OlapData.create(data, filteredGrid, agg);

    const notThere = olap.getRecord('Research|Sally|01');
    expect(notThere).toBe(undefined);

    const there = olap.getRecord('Sales|Jim|01');
    expect(there.department).toBe('Sales');

});

it('can rollup on missing dimensions', () => {
    const agg = {
        sum: recs => {
            const first = recs[0];

            const result = Object.assign({}, first, {
                sickdays: Utils.sum(r => r.sickdays)(recs),
                expenses: Utils.sum(r => r.expenses)(recs)        
            });

            return result;
        }
    }

    const newGrid = {
        rowdims: [{name:"department", type:""}],
        coldims: [{name:"month", type:"month"}],
        measures: [{name:"sickdays"}, {name:"expenses"}]
    }

    const olap = OlapData.create(data, newGrid, agg);

    //name should no longer matter now and we should have rolled up to the department level
    const research = olap.records.filter(r => r.department === "Research" && r.month === "Jun")[0];
    expect(research.expenses).toBe(1800.00);
    expect(research.dataKey).toBe("Research|06");
});

it('sorts on a sortkey', () => {
    const rec1 = {sortkey: "200|Research|200|Sally"};
    const rec2 = {sortkey: "200|Research|200|ZZZ___"};

    const result = Utils.compareBySortKey(false)(rec1, rec2);
    expect(result).toBe(-1);
});

it('creates a dimension view', () => {
    const agg = {
        sum: recs => {
            const first = recs[0];

            const result = Object.assign({}, first, {
                sickdays: Utils.sum(r => r.sickdays)(recs),
                expenses: Utils.sum(r => r.expenses)(recs)        
            });

            return result;
        }
    };

    const olap = OlapData.create(data, grid, agg);
})

