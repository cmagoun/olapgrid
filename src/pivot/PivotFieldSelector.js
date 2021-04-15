import React, { Component } from 'react';
import DynamicHeightCheck from './DynamicHeightCheck';
import './css/PivotFieldSelector.css';

class PivotFieldSelector extends Component {
    render() {
        const { fields, selectedfields} = this.props;
        return <div className="pfs_container">     
            
            <div className="pfs_title">Data Fields</div>
            <div className="pfs_vt">
                {fields.map(f => <DynamicHeightCheck 
                    key={f.name}
                    value={f.display} 
                    selected={selectedfields.includes(f.name)}
                    onClick={this.handleClick.bind(this, f.name)}/>)}
            </div>
        
        </div>
    }

    handleClick(fieldname) {
        this.props.onClick(fieldname);
    }
}

export default PivotFieldSelector;