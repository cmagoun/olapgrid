import React, { Component } from 'react';
import './css/DynamicHeightCheck.css';

const countTextLines = (text, charsPerLine) => {
    text = (text || '').toString();
    const cache = localStorage.getItem(text + "/" + charsPerLine);
    if (cache !== null) return cache;

    if (text.length <= charsPerLine) return 1;

    const atext = text.split(" ");

    let lines = 1;
    let currentLineLen = 0;

    for (let i = 0; i < atext.length; i++) {
        const word = atext[i];
        if (currentLineLen + (word.length + 1) > charsPerLine) {
            console.log("---");
            lines++;
            currentLineLen = word.length;
            console.log(word + ": " + currentLineLen);
        } else {
            currentLineLen += word.length + 1;
            console.log(word + ": " + currentLineLen);
        }
    }

    localStorage.setItem(text + "/" + charsPerLine, lines);
    return lines;

}

class DynamicHeightCheck extends Component {
    constructor(props) {
        super(props);
        this.lineHeight = props.lineHeight || 15;
        this.lineConst = props.lineConst || 8;
        this.lineWidth = props.lineWidth || 27;
    }

    render() {
        const {display, value, selected} = this.props;
        const height = (countTextLines(value, this.lineWidth) * this.lineHeight) + this.lineConst;
        const hstr = height + "px";

        return <div style={{height:hstr, marginTop:"2px", marginBottom:"2px"}}>
            {display || value}
            <input type="checkbox" className="dhc_checkStyle" checked={selected} onClick={this.props.onClick}></input>
        </div>
    }
}

export default DynamicHeightCheck;