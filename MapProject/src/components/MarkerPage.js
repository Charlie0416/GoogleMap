import React, {useContext, useLayoutEffect, useRef} from "react";
import {Types} from './Marker';
import {PageContext, PAGES} from "../App";

const InfoPage = ({marker}) => {
    const divRef = useRef();
    const titleRef = useRef();

    const titleStyle = {
        padding: "5px",
        borderBottom: "solid 4px black",
    };

    useLayoutEffect(() => {
        const imgsInContent = divRef.current.getElementsByTagName('img');
        for (let i = 0; i < imgsInContent.length; i++) {
            imgsInContent[i].style.width = '100%';
            imgsInContent[i].style.height = 'auto';
        }
    });

    return (
        <>
            <div ref={titleRef} style={titleStyle}>
                <table>
                    <tbody>
                        <tr>
                            <td className='text-center' style={{width: '30%'}}>
                                <img src={Types[marker.icon_name].icon_url} alt={Types[marker.icon_name]}/>
                            </td>
                            <td>
                                <p className='mt-3 text-center'>{marker.name}</p>
                                <p style={{fontSize: 'small'}}>地址：{marker.address}</p>
                                <p style={{fontSize: 'small'}}>聯絡電話：{marker.phone_number || '無'}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div ref={divRef} className='mt-3 px-2' style={{marginTop: "20px", fontSize: '14px'}}
                 dangerouslySetInnerHTML={{__html:marker.editor_input}}
            />
        </>
    );
};

const MarkerPage = ({marker,showNavbar}) => {
    const nowPage = useContext(PageContext);
    const style = {
        fontFamily: "微軟正黑體",
        marginTop: `${showNavbar ? 72 : 24}px`
    };
    return (
        <div id="content" style={style} className={nowPage === PAGES.DETAIL ? "" : "d-none"}>
            {marker && <InfoPage marker={marker}/>}
        </div>
    );
};

export default MarkerPage;