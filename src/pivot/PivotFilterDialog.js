import Dialog from '../dialog/Dialog';
import React, { Component } from 'react';
import DynamicHeightCheck from './DynamicHeightCheck';
import * as Utils from './Utils';
import './css/PivotFilterDialog.css';


class PivotFilterDialog extends Component {
    render() {
        const { open, dim, selected, filterText } = this.props;

        const buttons =  <input type="button" value="Done" onClick={this.apply.bind(this)} disabled={selected.length === 0}/>

        return (
            <Dialog 
                width={300} 
                height={600} 
                onClose={this.handleClose.bind(this)}
                onCancel={this.handleClose.bind(this)} 
                open={open} 
                title="Filter"
                buttons={buttons}>

                <div className="pfd_content">

                    <b>{dim.display}</b> filter options

                    <div className="pfd_filter">
                        <input style={{ width: '200px' }} type="text" value={filterText} onChange={this.handleChange.bind(this)} />
                        <input
                            style={{ width: '30px', marginLeft: '2px' }}
                            type="button"
                            value="x"
                            onClick={this.clearFilter.bind(this)}
                        />
                    </div>

                    <div className="pfd_filter">
                        <input style={{ width: '238px' }} type="button" value="Toggle All" onClick={this.toggleAll.bind(this)} />
                    </div>

                    <div className="pfd_list">
                        {this.getValues().map(v => (
                            <div key={v}>
                                <DynamicHeightCheck
                                    key={v}
                                    value={v}
                                    selected={selected.includes(v)}
                                    onClick={this.handleClick.bind(this, v)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Dialog>
        );
    }

    apply() {
        this.props.onDone();
    }

    clearFilter() {
        this.props.onFilterTextChanged('');
    }

    toggleAll() {
        const values = this.getValues();
        let selected = this.props.selected.slice() || values.slice();

        if (this.allValuesSelected(values, selected)) {
            values.forEach(v => {
                const i = selected.indexOf(v);
                if (i > -1) selected.splice(i, 1);
            });
        } else {
            selected = Utils.distinct([...this.props.selected, ...this.getValues()], x => x);
        }

        this.props.onSelectChanged(selected);
    }

    allValuesSelected(values, selected) {
        for (let i = 0; i < values.length; i++) {
            if (!selected.includes(values[i])) return false;
        }

        return true;
    }

    handleClose() {
        this.props.onCancel();
    }

    getValues() {
        if (this.props.filterText === '') return this.props.values;
        return this.props.values.filter(v => v.toLowerCase().includes(this.props.filterText.toLowerCase()));
    }

    handleChange(evt) {
        this.props.onFilterTextChanged(evt.target.value);
    }

    handleClick(value) {
        const selected = this.props.selected;
        const index = selected.indexOf(value);
        if (index > -1) {
            selected.splice(index, 1);
        } else {
            selected.push(value);
        }

        this.props.onSelectChanged(selected);
    }
}

export default PivotFilterDialog;
