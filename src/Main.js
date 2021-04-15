import React, {useState} from 'react';
import { sum } from './pivot/Utils';
import PivotManager from './pivot/PivotManager';
import OlapData from './pivot/OlapData';
import { PivotContext } from './pivot/PivotContext';
import PivotGrid from './pivot/PivotGrid';
import PivotConfig from './pivot/PivotConfig';

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
    ],
    coldims: [
        { name: "month", display: "Month", type:"month", total: "All Months", defaultPos: OlapData.COL}
    ],
    measures: [
        { name: "sickdays", display: "Sick", type:"month", total: "", defaultPos: OlapData.MES, format: ""   },
        { name: "expenses", display: "Expenses", type:"", total: "", defaultPos: OlapData.MES, format: "$"} 
    ],
    formats: ["", "$"],
    fields: [
        { name: "department", display: "Dept", type:"",total: "All Depts", defaultPos: OlapData.ROW },
        { name: "name", display: "Employee", type:"",total: "All Employees", defaultPos: OlapData.ROW},
        { name: "month", display: "Month", type:"month", total: "All Months", defaultPos: OlapData.COL},
        //{ name: "qtr", display: "Qtr", type: "", total: "All Qtr", defaultPos: OlapData.COL, requiresPrep: true },
        { name: "sickdays", display: "Sick", type:"month", total: "", defaultPos: OlapData.MES, format: ""   },
        { name: "expenses", display: "Expenses", type:"", total: "", defaultPos: OlapData.MES, format: "$"},
        { name: "dataKey", display: "Data Key", type: "", total: "", defaultPos: OlapData.MES, format: ""},
        { name: "sortkey", display: "Sort Key", type: "", total: "", defaultPos: OlapData.MES, format: ""}
    ],
    // filters: {
    //     department: "Research",
    //     month: "Jan"
    // }
};

const agg = {
    // prep: (rec, recs, od) => {
    //     let qtr = "";
    //     switch(rec.month) {
    //         case "Jan":
    //         case "Feb":
    //         case "Mar":
    //             qtr = "Q1";
    //             break;

    //         case "Apr":
    //         case "May":
    //         case "Jun":
    //             qtr = "Q2";
    //             break;

    //         case "Jul":
    //         case "Aug":
    //         case "Sep":
    //             qtr = "Q3";
    //             break;

    //         case "Oct":
    //         case "Nov":
    //         case "Dec":
    //             qtr = "Q4";
    //             break;

    //         default:
    //             qtr = "";
    //     }

    //     return {...rec, qtr};
    // },
    sum: recs => {
        return {
            sickdays: sum(r => r.sickdays)(recs),
            expenses: sum(r => r.expenses)(recs),
        }
    },
}

const Main = props => {
    const [update, setUpdate] = useState(0);

    const [mgr, setMgr] = useState(new PivotManager(data, grid, agg, () => setUpdate(mgr.version)));
    const od = OlapData.create(data, grid, agg, mgr.caches);

    console.log("version: " + update);

    return <div>
        <PivotContext.Provider value={mgr}>
            <div className="Main-root">
                <div className="Main-left">
                    <PivotGrid
                        minHeight="60vh"
                        minWidth="60vw"
                        maxWidth="100%"
                        maxHeight="100%"
                        olap={od}
                        onDetail={() => null}/>
                </div>
                <div className="Main-right">
                    <PivotConfig
                        olap={od}
                        dataset={data}/>
                </div>
            </div>


        </PivotContext.Provider>
    </div>
}

export default Main;