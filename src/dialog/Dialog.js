import React from 'react';
import Centered from './Centered';
import './Dialog.css';

const Dialog = (props) => {
    return props.open &&
        <Centered height={props.height} width={props.width}>
            <DialogBody title={props.title} open={props.open} z={props.z} buttons={props.buttons} onCancel={props.onCancel}>
                {props.children}
            </DialogBody>
        </Centered>
}

const DialogBody = (props) => {
    const style = {
        container: {
            height: props.height || "100%",
            width: props.width || "100%",
            display: props.open ? "" : "none",
            zIndex: props.z || ""
        },
    };

    return <div style={style.container} className="dialog_container">
        <div className="dialog_titlebar">
            <div className="dialog_title">{props.title}</div>
            <div className="dialog_x" onClick={props.onCancel}>X</div>
        </div>   

        <div className="dialog_text">
            {props.children}
        </div>

        <div className="dialog_buttoncontainer">
            {props.buttons}
        </div>
    </div>
}


export default Dialog;