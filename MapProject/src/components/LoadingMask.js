import React, {useLayoutEffect} from 'react';
import ReactDOM from "react-dom";
import Spinner from "react-bootstrap/Spinner";

export default function LoadingMask({show}) {
    const body = document.getElementsByTagName('body')[0];
    const mask = (
        <div className='position-fixed bg-dark d-flex justify-content-center align-items-center'
             style={{opacity:0.5,zIndex:1500,width:'100vw',height:'100vh',top:0,left:0}}
        >
            <Spinner animation='border' variant='primary'/>
        </div>
    );

    useLayoutEffect(()=>{
        if (show){
            body.classList.add('position-relative');
        } else {
            body.classList.remove('position-relative');
        }
    },[show]);

    return show ? ReactDOM.createPortal(mask,body) : <></>;
}
