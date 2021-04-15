import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import OlapData from './OlapData';
import './css/PivotDimensionItem.css';
import {faCog, faFilter, faCaretSquareDown, faCaretSquareUp} from '@fortawesome/fontawesome-free-solid';

class PivotDimensionItem extends Component {
    render() {
        const {dim, index, type, leafIndex, filters} = this.props;

        const filterColor = 
            filters === undefined || 
            filters[dim.name] === undefined
                ? "white"
                : "salmon"

        const filtercog = type === OlapData.MES
            ? <FontAwesomeIcon icon="cog" size="sm" onClick={this.openMeasure.bind(this, dim)}/>
            : <FontAwesomeIcon icon="filter" size="sm" color={filterColor} onClick={this.filter.bind(this, dim)}/>;

        const up = index > 0 
            ? <FontAwesomeIcon icon="caret-square-up" size="sm" onClick={this.moveUp.bind(this, index)}/> 
            : <div className="whitespace"/>;
        
        const down = index < leafIndex 
            ? <FontAwesomeIcon icon="caret-square-down" size="sm" onClick={this.moveDown.bind(this, index)}/> 
            : <div className="whitespace"/>;
        
        const move = type === OlapData.ROW
            ? <div className="pdi_button" onClick={this.moveToColumn.bind(this, dim)}>C</div>
            : type === OlapData.COL
                ? <div className="pdi_button" onClick={this.moveToRow.bind(this,dim)}>R</div>
                : <div className="pdi_whitespace"/>;

        return <div className="pdi_item">
            <div>{dim.display}</div>
            <div className="pdi_buttons">
                <div className="pdi_button">{filtercog}</div>
                <div className="pdi_button">{up}</div>
                <div className="pdi_button">{down}</div>
                <div className="pdi_button">{move}</div>
            </div>
        </div>
    }

    moveUp(index) {
        this.props.moveUp(index);
    }

    moveDown(index) {
        this.props.moveDown(index);
    }

    moveToColumn(dim) {
        this.props.moveToColumn(dim);
    }

    moveToRow(dim) {
        this.props.moveToRow(dim);
    }

    filter(dim) {
        this.props.openFilter(dim);
    }

    openMeasure(dim) {
        this.props.openMeasure(dim);
    }
}

export default PivotDimensionItem;