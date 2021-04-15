import React, { Component } from 'react';
import OlapData from './OlapData';
import { PivotContext } from './PivotContext';
import PivotManager from './PivotManager';
import PivotGrid from './PivotGrid';
import PivotConfig from './PivotConfig';

const styles = {
    root: {
        position: "relative",
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
        width: "100%",
        justifyContent: 'space-between'
    },
    left: {
        width: "74vw",
        height: "80vh",
        overflow: 'auto',
        marginRight: "5px"
    },

    right: {
        width: "10vw",
        height: "80vh",
    }
};


class PivotTable extends Component{
    constructor(props) {
        super(props);
        this.mgr = {};
        this.updated = this.updated.bind(this);
        this.state = {update:0};
    }

    render() {
        const {data, grid, agg} = this.props;

        this.mgr = new PivotManager(data, grid, agg, this.updated);
        const od = OlapData.create(data, grid, agg);

        return <PivotContext.Provider value={this.mgr}>
            <div style={styles.root}>
                <div style={styles.left}>
                    {data && grid &&
                        <PivotGrid minHeight="60vh" minWidth="60vw" maxWidth="100%" maxHeight="100%" olap={od} />
                    }
                </div>
                <div style={styles.right}>
                    <PivotConfig
                        olap={od}
                        dataset={data}/>
                </div>
            </div>
        </PivotContext.Provider>
    }

    updated() {
        this.setState({update: this.state.update + 1 });
    }
}

export default PivotTable;

