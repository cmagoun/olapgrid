import React, { Component } from 'react';
import PivotMeasures from './PivotMeasures';
import * as Utils from './Utils';
import OlapData from './OlapData';
import './css/PivotRows.css';

class PivotRows extends Component {
    render() {
        const {olap} = this.props;
        const rv = olap.getDimensionPage("row", olap.rowpage);
        const cleaf = olap.dimensionLevel("col", olap.coldims.length-1, olap.colpage);
        const rleaf = olap.dimensionLevel("row", olap.rowdims.length-1, olap.rowpage);

        return <React.Fragment>
            {rv.map((row, index) => {
                return <tr key={index}>
                    {olap.rowdims.map((dim, ri) => {
                        return row[ri] !== null
                            ? row[ri].value !== OlapData.ISSUM
                                ? <td key={ri} className={"fixed freeze_horz pr_title"} rowSpan={row[ri].count}>{row[ri].value}</td>
                                : <td key={ri} className={"fixed freeze_horz pr_sum"} rowSpan={row[ri].count}>{dim.total}</td>
                            : null;
                    })}
                    

                    {cleaf.map((col,ci) => <PivotMeasures key={ci} olap={olap} dkey={Utils.createKey(rleaf[index].key, col.key)} totalStyleClass="pr_total" valueStyleClass="pr_value" onDetail={this.props.onDetail} />)}     

                    </tr>
                
            })}
        </React.Fragment>
    }
}


export default PivotRows;