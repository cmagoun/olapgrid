import React, {useState} from 'react';
import DynamicHeightCheck from './pivot/DynamicHeightCheck';

const values = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Lots and lots of stuff in a line of text"];

const CheckTest = props => {
    const [selected, setSelected] = useState([]);

    const toggleSelected = v => {
        if(selected.includes(v)) {
            const newSelected = selected.filter(s => s !== v);
            setSelected(newSelected);
        } else {
            setSelected([...selected, v]);
        }
    }

    return <div>
        {values.map(v => <DynamicHeightCheck
            key={v}
            value={v}
            selected={selected.includes(v)}
            onClick={() => toggleSelected(v)}/>)}
    </div>
}

export default CheckTest;