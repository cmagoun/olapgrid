import React, {useState} from 'react';
import { sum, avg } from './pivot/Utils';
import PivotManager from './pivot/PivotManager';
import OlapData from './pivot/OlapData';
import { PivotContext } from './pivot/PivotContext';
import PivotGrid from './pivot/PivotGrid';
import PivotConfig from './pivot/PivotConfig';
import {createData} from './DatasetGenerator';
import moment from 'moment';

const data = createData(500000);

const grid = {
    rowdims: [],
    coldims: [],
    measures: [],
    fields: [
        { name: "department", display: "Dept", total: "All Depts", defaultPos: OlapData.ROW },
        { name: "material", display: "Material", total: "All Mats", defaultPos: OlapData.ROW },
        { name: "adjective", display: "Adjective", total: "All Adjectives", defaultPos: OlapData.ROW },
        { name: "category", display: "Category", total: "All Categories", defaultPos: OlapData.ROW },
        { name: "name", display: "Product", total: "All Products", defaultPos: OlapData.ROW},
        { name: "qtr", display: "Qtr", total: "All Qtrs", defaultPos: OlapData.COL, requiresPrep: true},
        { name: "qty", display: "Qty", type:"month", total: "", defaultPos: OlapData.MES, format: "" },
        { name: "amt", display: "Sales Amt", type:"", total: "", defaultPos: OlapData.MES, format: "$"},
        { name: "avgPrice", display: "Avg Price", type:"", total: "", defaultPos: OlapData.MES, format: "$"}
    ],
};

const agg = {
    prep: (rec, recs, od) => {
        rec.qtr = `${moment(rec.salesDate).utc().year()} Q${moment(rec.salesDate).utc().quarter()}`;
        return rec;
    },

    sum: recs => {
        //const first = recs[0];
        return {
            //...first,
            qty: sum(r => r.qty)(recs),
            amt: sum(r => r.amt)(recs),
            avgPrice: avg(r => r.price)(recs)
        }
    }
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