import React, { Component } from 'react';
import OlapData from './OlapData';
import withContext from '../withContext';
import {PivotContext} from './PivotContext';

const fmt_currency = (decimals) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits:decimals });
const formatCurrency = (number, decimals) => {return fmt_currency(decimals).format(number);}

const formatPercent = (number, places) => {
    if (number) {
        const d = places !== undefined
            ? places
            : 2;
        return number.toFixed(d) + "%";
    }

    return '';
}

class PivotMeasures extends Component {
    render() {
        const {totalStyleClass,valueStyleClass,olap, dkey} = this.props;
        return <React.Fragment>
            {olap.measures.map((m,i) => {
                const record = olap.getRecord(dkey);

                const classStyle=dkey.includes(OlapData.ISSUM)
                    ? totalStyleClass
                    : valueStyleClass;

                if(!record) return <td key={m.name} className={classStyle}>0</td>;

                return <td key={m.name} className={classStyle} onContextMenu={this.handleRightClick.bind(this)}>{this.formatMeasure(record[m.name], m.format)}</td>;
            })}
        </React.Fragment>
    }

    formatMeasure(value, format) {
        switch(format.toLowerCase()) {
            case "money":
            case "currency":
            case "$":
            case "$2":
                return formatCurrency(value, 2);
            case "$0":
            case "dollar":
                return formatCurrency(value, 0);
            case "$4":
                return formatCurrency(value, 4);
            case "$6":
                return formatCurrency(value, 6);
            case "$x":
                return formatCurrency(value, 10);
            case "percent":
            case "%":
                return formatPercent(value, 2);
            case "dpercent":
            case "d%":
                return formatPercent(value * 100, 2);
            case "i":
                return Math.round(value);
            default:
                return value;
        }
    }

    handleRightClick(evt) {
        const {dkey, olap} = this.props;
        this.props.onDetail(dkey, olap.rowdims, olap.coldims);
        evt.preventDefault();
    }
}

export default withContext(PivotContext)(PivotMeasures);