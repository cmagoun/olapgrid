import Dialog from '../dialog/Dialog';
import React, { Component } from 'react';
import withContext from '../withContext';
import { PivotContext } from './PivotContext';
import './css/PivotDimensionDialog.css';

class PivotMeasureDialog extends Component {
    constructor(props) {
        super(props);
        this.state = { name: '', format: '' };
    }

    static getDerivedStateFromProps(props, state) {
        return props.measure.name !== state.name ? { format: props.measure.format, name: props.measure.name } : null;
    }

    render() {
        const { open, measure } = this.props;
        const buttons =  <input type="button" value="Done" onClick={this.apply.bind(this)}/>

        return (
            measure !== undefined && (
                <Dialog 
                    height={120} 
                    width={300} 
                    onClose={this.handleClose.bind(this)} 
                    onCancel={this.handleClose.bind(this)}
                    open={open} 
                    title={`${measure.display} Options`}
                    buttons={buttons}>

                    <div className="pdd_content">
                        <div className="pdd_row">
                            <div className="pdd_rowlabel">Format:</div>
                            <div>
                                <select value={this.state.format} onChange={this.changeFormat.bind(this)}>
                                    <option value="$">Currency</option>
                                    <option value="$0">Currency (rounded)</option>
                                    <option value="">Number/General</option>
                                    <option value="%">Percent</option>
                                    <option value="d%">Percent (from decimal)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </Dialog>
            )
        );
    }

    changeFormat(evt) {
        this.setState({ format: evt.target.value });
    }

    apply() {
        const { context, measure } = this.props;
        context.changeMeasureFormat(measure, this.state.format);
        this.props.onDone();
    }

    handleClose() {
        this.props.onCancel();
    }
}

export default withContext(PivotContext)(PivotMeasureDialog);
