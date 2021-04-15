import React, { Component } from 'react';
import OlapData from './OlapData';
import {PivotContext} from './PivotContext';
import withContext from '../withContext';
import './css/PivotColumns.css';

class PivotColumns extends Component {
    render() {
        const {olap} = this.props;
        const measures = olap.measures;

        let leafLevel = olap.dimensionLevel("col", olap.coldims.length-1, olap.colpage);
        const colspan = olap.rowdims.length;

        if(olap.coldims.length > 0) {
            const rowspan = olap.rowdims.length
                ? olap.coldims.length + 1
                : olap.coldims.length + 2;

            return <React.Fragment>
                { 
                    olap.coldims.map((cd, i) => {
                    return <tr key={i}>
                        {i === 0 && <td className={"fixed freeze_all pc_pad"} colSpan={colspan} rowSpan={rowspan}>&nbsp;</td>}

                        {olap.dimensionLevel("col", i, olap.colpage).map((cell, ci) => {
                            return cell.value !== OlapData.ISSUM
                                ? <td key={ci} className={"fixed freeze_vert pc_title"} colSpan={cell.count * (measures.length || 1)}>{cell.value}</td>
                                : <td key={ci} className={"fixed freeze_vert pc_sum"} colSpan={cell.count * (measures.length || 1)}>{cd.total}</td>
                                
                        })}
                    </tr>
                })}

                <tr>
                    {leafLevel.map(leaf => {
                        return measures.map((meas, i) => { 
                            const icon = leaf.key === olap.sort.cohort && meas === olap.sort.measure
                                ? olap.sort.desc
                                    ? " v"
                                    : " ^"
                                : null;

                            return <td 
                                key={meas.name} 
                                className={"fixed freeze_vert pc_measure" } 
                                onClick={this.handleSort.bind(this, leaf.key, meas)}>{meas.display}{icon}</td>
                        })
                    })}
                </tr>
            </React.Fragment>
        } else {
            const rowspan = olap.rowdims.length
                ? olap.coldims.length + 1
                : 2;

            return <tr>
                <td colSpan={colspan} className={"fixed freeze_all pc_pad" } rowSpan={rowspan}></td>
                {measures.map((meas,i) => {
                    const icon = meas === olap.sort.measure
                    ? olap.sort.desc
                        ? " v"
                        : " ^"
                    : null;

                    return  <td 
                        key={meas.name} 
                        className={"fixed freeze_vert pc_measure" }
                        onClick={this.handleSort.bind(this, "", meas)}>{meas.display}{icon}</td>        
                })}
            </tr>
        }
    }

    handleSort(key, measure) {
        this.props.context.changeSort(key, measure);
    }
}

export default withContext(PivotContext)(PivotColumns);
