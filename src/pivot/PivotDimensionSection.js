import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PivotDimensionItem from "./PivotDimensionItem";
import OlapData from "./OlapData";
import PivotPageList from "./PivotPageList";
import PivotDimensionDialog from "./PivotDimensionDialog";
import PivotMeasureDialog from './PivotMeasureDialog';
import './css/PivotDimensionSection.css';

class PivotDimensionSection extends Component {
    constructor(props) {
        super(props);
        this.state={dialogOpen:false, measureDialogOpen:false, dialogMeasure:""};
    }

    render() {
        const {dims, type, pages, selectedpage, filters} = this.props;
        const title = type === OlapData.ROW ? "Row" : this.props.type === OlapData.COL ? "Column" : "Measures"

        //const pager = null;
        const pager = pages !== undefined && pages.length > 0
            ? <PivotPageList
                type={type}
                pages={pages}
                selected={selectedpage}/>
            : null;

        return <React.Fragment>

            <div className="pds_title">
                {title}
                &nbsp;
                {type !== OlapData.MES &&
                    <FontAwesomeIcon icon="cog" size="sm" onClick={this.handleCogClick.bind(this)}/>
                }
            </div>
            <div className="pds_container">
                {pager}
            </div>
            <div className="pds_container">
                {dims.map((d, i) => <PivotDimensionItem 
                    key={d.name}
                    type={type} 
                    dim={d} 
                    index={i}
                    filters={filters} 
                    leafIndex={dims.length-1}
                    moveUp={this.moveUp.bind(this)}
                    moveDown={this.moveDown.bind(this)}
                    moveToColumn={this.moveToColumn.bind(this)}
                    moveToRow={this.moveToRow.bind(this)}
                    openFilter={this.openFilter.bind(this)}
                    openMeasure={this.openMeasure.bind(this)}/>)}
            </div>
           
            {type !== OlapData.MES &&
                <PivotDimensionDialog
                    type={this.props.type}
                    open={this.state.dialogOpen}
                    onCancel={this.closeDialog.bind(this)}
                    onDone={this.closeDialog.bind(this)}/>
            }
        
            {type === OlapData.MES &&
                <PivotMeasureDialog
                    open={this.state.measureDialogOpen}
                    measure={this.state.dialogMeasure}
                    onCancel={this.closeMeasureDialog.bind(this)}
                    onDone={this.closeMeasureDialog.bind(this)}/>
            } 

        </React.Fragment>
        
         
    }

    closeDialog() {
        this.setState({dialogOpen:false});
    }

    closeMeasureDialog() {
        this.setState({measureDialogOpen:false});
    }

    handleCogClick() {
        this.setState({dialogOpen:true});
    }

    moveUp(index) {
        this.props.swapDims(this.props.type, index, index-1);
    }

    moveDown(index) {
        this.props.swapDims(this.props.type, index, index+1);
    }

    moveToColumn(dim) {
        this.props.moveDim(dim.name, OlapData.ROW);
    }

    moveToRow(dim) {
        this.props.moveDim(dim.name, OlapData.COL);
    }

    openFilter(dim) {
        this.props.openFilter(dim);
    }

    openMeasure(measure) {
        this.setState({measureDialogOpen:true, dialogMeasure:measure});
    }
}

export default PivotDimensionSection;