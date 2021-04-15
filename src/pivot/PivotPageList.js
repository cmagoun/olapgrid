import React, { Component } from "react";
import withContext from '../withContext';
import {PivotContext} from './PivotContext';
import './css/PivotPageList.css';

class PivotPageList extends Component {
    render() {
        const {selected, pages} = this.props;
        
        return  <div className="ppl_container">
            <div>Pages:</div>
            <select className="ppl_dd" value={selected} onChange={this.changePage.bind(this)}>
                {pages.map((p,i) => {
                    const text = p.first.value === p.last.value
                        ? p.first.value
                        : `${p.first.value}-${p.last.value}`;

                    return <option key={text} value={i}>{text}</option>
                })}
            </select>
        </div>
    }

    changePage(evt) {
        const {context, type} = this.props;
        context.changePage(type, evt.target.value);
    }
}

export default withContext(PivotContext)(PivotPageList);