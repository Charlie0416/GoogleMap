import React, { useMemo, useRef, useContext } from 'react';
import { Overlay, Popover } from "react-bootstrap";
import InfoWindow from "./InfoWindow";
import getFirstImgUrl from "../utils/getFirstImgUrl";
import { PAGES, PageContext } from "../App";

const icon_base_url = 'https://www.plynet.com.tw/images/travelMap/';
export const Types = {
    Station: { value: 1 << 0, description: '車站', icon_url: icon_base_url + "station.png" },
    Airport: { value: 1 << 1, description: '機場', icon_url: icon_base_url + "airport.png" },
    Spot: { value: 1 << 2, description: '景點', icon_url: icon_base_url + "scenic_spot.png" },
    Food: { value: 1 << 3, description: '美食(區)', icon_url: icon_base_url + "food.png" },
    Building: { value: 1 << 4, description: '場館', icon_url: icon_base_url + "arena.png" },
    Shopping: { value: 1 << 5, description: '購物區/商城', icon_url: icon_base_url + "shopping.png" },
    Spring: { value: 1 << 6, description: '溫泉', icon_url: icon_base_url + "hot_spring.png" },
    Park: { value: 1 << 7, description: '遊樂園區', icon_url: icon_base_url + "playground.png" },
    Hotel: { value: 1 << 8, description: '住宿', icon_url: icon_base_url + "hotel.png" },
    Experience: { value: 1 << 9, description: '體驗學習', icon_url: icon_base_url + "experience.png" },
    Other: { value: 1 << 10, description: '其他', icon_url: icon_base_url + "others.png" },
};

const defaultInfoImgUrl = "https://dl.tomeet.net/93/2093/f/徵稿.jpg";

export default React.memo(function Marker({ marker, handleDoubleCliCk,showInfoWindow, ...props }) {
    const nowPage = useContext(PageContext);
    const style = {
        width: '30px',
        height: '50px',
        position: 'absolute',
        transform: 'translate(-50%, -100%)',
        zIndex: showInfoWindow ? '10' : ''
    };
    const markerRef = useRef();
    //滑鼠計時
    const last = useRef(0);
    const now = useRef(0);
   //滑鼠事件   
   const mouseDown=()=>{
    last.current =new Date();
    console.log(last)
}

const mouseUp=()=>{
    console.log(nowPage)
    if(nowPage===PAGES.MAP){
        props.onClick(marker);
    }else if(nowPage===PAGES.PLANNING){
        now.current = new Date();
        console.log(now.current)
        console.log(parseInt(now.current - last.current))
        if (parseInt(now.current - last.current) >500) {
          handleDoubleCliCk(marker);
        }else{
            props.onClick(marker);
        }
    }
   
}
    const handleShowDetailClick = () => {
        props.onShowDetailClick(marker)
    };

    const popperConfig = useMemo(() => {
        return {
            modifiers: [
                {
                    name: 'preventOverflow',
                    enabled: false,//關掉它
                    phase: 'main',
                    fn: () => { },
                },
            ],
        };
    }, []);
    const infoImgUrl = useMemo(() => {
        console.log(`${marker.name} Marker Changed`);
        return getFirstImgUrl(marker.editor_input, defaultInfoImgUrl);
    }, [marker]);
    return (
        <div ref={markerRef} style={style} onClick={(e) => e.stopPropagation()}>
         
            <img style={{ objectFit: 'contain', width: "100%" }} onTouchStart={mouseDown} onTouchEnd={mouseUp} onMouseDown={mouseDown} onMouseUp={mouseUp}
                src={Types[marker.icon_name].icon_url} alt=""
            />
            <Overlay show={showInfoWindow} placement="top"
                target={markerRef.current} container={markerRef.current}
                popperConfig={popperConfig}
            >
                <Popover id={`infowindow-${marker.id}`}>
                    <Popover.Content as={InfoWindow} marker={marker} imgUrl={infoImgUrl}
                        defaultImgUrl={defaultInfoImgUrl}
                        onShowDetailClick={handleShowDetailClick}
                    />
                </Popover>
            </Overlay>
        </div>
    );
});