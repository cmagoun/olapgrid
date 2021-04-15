import Dialog from '../dialog/Dialog';
import React, { Component } from 'react';
import OlapData from './OlapData';
import withContext from '../withContext';
import { PivotContext } from './PivotContext';
import './css/PivotDimensionDialog.css';

class PivotDimensionDialog extends Component {
    constructor(props) {
        super(props);

        const perpage = props.type === OlapData.ROW ? props.context.grid.rowsperpage : props.context.grid.colsperpage;

        const showtotals =
            props.type === OlapData.ROW ? props.context.grid.rowsums === OlapData.SHOWSUM : props.context.grid.colsums === OlapData.SHOWSUM;

        this.state = {
            perpage,
            showtotals
        };
    }
    render() {
        const { open, type } = this.props;
        const word = type === OlapData.ROW ? 'Row' : 'Column';

        const buttons = <input type="button" onClick={this.apply.bind(this)} value="Done"/>
        const title = word + " Options";

        return (
            <Dialog height={150} width={300} 
                onCancel={this.handleClose.bind(this)} 
                onClose={this.handleClose.bind(this)} 
                open={open} title={title}
                buttons={buttons}>

                <div className="pdd_content">
                    <div className="pdd_row">
                        <div className="pdd_rowlabel">{word}s Per Page (approx.):</div>
                        <div>
                            <input
                                className="pdd_rowbox"
                                type="text"
                                value={this.state.perpage}
                                onChange={this.changePerPage.bind(this)}
                            />
                        </div>
                    </div>
                    <div className="pdd_row">
                        <div className="pdd_rowlabel">Show Totals on {word}s:</div>
                        <input type="checkbox" checked={this.state.showtotals} onChange={this.changeShowTotals.bind(this)} />
                    </div>
                </div>
            </Dialog>
        );
    }

    apply() {
        const { context, type } = this.props;
        const show = this.state.showtotals ? 'show' : 'none';

        context.setPerPage(type, this.state.perpage);
        context.setShowTotals(type, show);
        this.props.onDone();
    }

    changePerPage(evt) {
        this.setState({ perpage: evt.target.value });
    }

    changeShowTotals(evt) {
        this.setState({ showtotals: evt.target.checked });
    }

    handleClose() {
        this.props.onCancel();
    }
}

export default withContext(PivotContext)(PivotDimensionDialog);
