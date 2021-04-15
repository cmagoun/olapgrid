import React, { Component } from 'react';
import PivotDimensionSection from './PivotDimensionSection';
import PivotFieldSelector from './PivotFieldSelector';
import OlapData from './OlapData';
import PivotFilterDialog from './PivotFilterDialog';
import * as Utils from './Utils';
import withContext from '../withContext';
import { PivotContext } from './PivotContext';
import './css/PivotConfig.css';

class PivotConfig extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filters: {},
            dialogOpen: false,
            dialogDim: {},
            dialogValues: [],
            dialogSelected: [],
            dialogFilter: ''
        };
    }

    render() {
        const mgr = this.props.context;
        const { fields, filters } = mgr.grid;
        const selected = mgr.getSelectedFields();
        const rowdims = mgr.getConfigDims(OlapData.ROW);
        const coldims = mgr.getConfigDims(OlapData.COL);
        const measures = mgr.getConfigDims(OlapData.MES);

        const rowpages = this.props.olap.rowpages;
        const colpages = this.props.olap.colpages;

        return (
            <React.Fragment>
                <div className="config_vert">
                    <PivotFieldSelector fields={fields} selectedfields={selected} onClick={this.onFieldSelected.bind(this)} />
                    <div className="config_whitespace" />
                    <PivotDimensionSection
                        type={OlapData.ROW}
                        dims={rowdims}
                        pages={rowpages}
                        filters={filters}
                        selectedpage={mgr.grid.page.row}
                        swapDims={this.swapDims.bind(this)}
                        moveDim={this.moveDim.bind(this)}
                        openFilter={this.dialogOpenFilter.bind(this)}
                    />
                    <div className="config_whitespace"/>
                    <PivotDimensionSection
                        type={OlapData.COL}
                        dims={coldims}
                        pages={colpages}
                        filters={filters}
                        selectedpage={mgr.grid.page.col}
                        swapDims={this.swapDims.bind(this)}
                        moveDim={this.moveDim.bind(this)}
                        openFilter={this.dialogOpenFilter.bind(this)}
                    />
                    <div className="config_whitespace" />
                    <PivotDimensionSection
                        type={OlapData.MES}
                        dims={measures}
                        swapDims={this.swapDims.bind(this)}
                        moveDim={this.moveDim.bind(this)}
                    />
                </div>

                <PivotFilterDialog
                    open={this.state.dialogOpen}
                    dim={this.state.dialogDim}
                    values={this.state.dialogValues}
                    selected={this.state.dialogSelected}
                    filterText={this.state.dialogFilter}
                    onCancel={this.dialogCancelFilter.bind(this)}
                    onDone={this.dialogApplyFilter.bind(this)}
                    onSelectChanged={this.dialogSelectChanged.bind(this)}
                    onFilterTextChanged={this.dialogFilterTextChanged.bind(this)}
                />
            </React.Fragment>
        );
    }

    dialogOpenFilter(dim) {
        const values = Utils.distinct(this.props.dataset.map(r => r[dim.name]), x => x).sort();
        const selected = this.props.context.grid.filters[dim.name] || values.slice();

        //this.props.context.assignCountToField(dim.name, values.length);

        this.setState({
            dialogOpen: true,
            dialogDim: dim,
            dialogValues: values,
            dialogSelected: selected,
            dialogFilter: ''
        });
    }

    dialogFilterTextChanged(dialogFilter) {
        this.setState({ dialogFilter });
    }

    dialogSelectChanged(dialogSelected) {
        this.setState({ dialogSelected });
    }

    dialogApplyFilter() {
        const { dialogSelected, dialogValues, dialogDim } = this.state;

        //all are clicked so erase the filter on this field
        const selected = dialogSelected.length === dialogValues.length
            ? undefined
            : dialogSelected;

        this.props.context.setFilter(dialogDim.name, selected);
        this.clearDialog();
    }

    dialogCancelFilter() {
        this.clearDialog();
    }

    clearDialog() {
        this.setState({
            dialogOpen: false,
            dialogDim: {},
            dialogValues: [],
            dialogSelected: [],
            dialogFilter: ''
        });
    }

    moveDim(fieldName, from) {
        this.props.context.moveDim(fieldName, from);
    }

    swapDims(roworcol, index1, index2) {
        this.props.context.swapDims(roworcol, index1, index2);
    }

    onFieldSelected(fieldname) {
        this.props.context.toggleField(fieldname);
    }
}

export default withContext(PivotContext)(PivotConfig);
