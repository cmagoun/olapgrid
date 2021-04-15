import React, { Component } from 'react';
import PivotRows from './PivotRows';
import withContext from '../withContext';
import {PivotContext} from './PivotContext';
import PivotColumns from './PivotColumns';

const styles = {
    table: {
        borderCollapse: "separate",
        tableLayout: "fixed",
        borderSpacing: "0px"
    },
    scrolltable: {
        whiteSpace: 'nowrap',
        overflow: 'auto'
    }
}

class PivotGrid extends Component {
    constructor(props) {
        super(props);
        this.div = {};
        this.handleScroll = this.freezePanes;
    }
    render() {
        const style = Object.assign({}, styles.scrolltable,
            {
                maxHeight: this.props.maxHeight,
                maxWidth: this.props.maxWidth,
                minWidth: this.props.minWidth,
                minHeight: this.props.minHeight,
                margin: "-1px",
                display: this.props.olap.rowdims.length > 0 || this.props.olap.coldims.length > 0 ? 'block' : 'none'
            });

        return <div id="olap_grid" style={style}>
            <table border="1" style={styles.table}>
                <tbody>
                    <PivotColumns olap={this.props.olap}/>
                    <PivotRows olap={this.props.olap} onDetail={this.props.onDetail}/>
                </tbody>
            </table>
        </div>
    }

    componentDidMount() {
        this.div = document.getElementById("olap_grid");
        this.div.addEventListener("scroll", this.handleScroll);
    }

    componentWillUnmount() {
        this.div.removeEventListener("scroll", this.handleScroll);
    }

    freezePanes(evt) {
        const translate_y = "translate(0," + evt.target.scrollTop + "px)";
        const translate_x = "translate(" + evt.target.scrollLeft + "px,0px)";
        const translate_xy = "translate(" + evt.target.scrollLeft + "px," + evt.target.scrollTop + "px)";

        const fixed_vert = document.getElementsByClassName("freeze_vert");
        const fixed_horz = document.getElementsByClassName("freeze_horz");
        const fixed = document.getElementsByClassName("freeze_all");

        for (let i = 0; i < fixed_vert.length; i++) {
            fixed_vert[i].style.transform = translate_y;
        }

        for (let i = 0; i < fixed_horz.length; i++) {
            fixed_horz[i].style.transform = translate_x;
        }

        for (let i = 0; i < fixed.length; i++) {
            fixed[i].style.transform = translate_xy;
        }
    }
}

export default withContext(PivotContext)(PivotGrid);
