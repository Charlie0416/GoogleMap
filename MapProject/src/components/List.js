import React, {useContext, useMemo} from 'react';
import {Col, Image, ListGroup, Row} from "react-bootstrap";
import {Types} from './Marker';
import {PageContext, PAGES} from "../App";
import getFirstImgUrl from "../utils/getFirstImgUrl";

const ListMarker = React.memo(function({marker, onClick}){
    const imgUrl = getFirstImgUrl(marker.editor_input, Types[marker.icon_name].icon_url);
    const handleImgError = (e)=>{
        e.target.src = Types[marker.icon_name].icon_url;
    };
    return (
        <ListGroup.Item onClick={()=>onClick(marker)}>
            <Row>
                <Col xs={3} className="p-0 align-self-center">
                    <Image src={imgUrl} className='w-100' thumbnail onError={handleImgError}/>
                </Col>
                <Col>
                    <p> {marker.name}</p>
                    <p> {marker.address}</p>
                </Col>
            </Row>
        </ListGroup.Item>
    );
});

export default React.memo(function List({markers, location, onShowDetailClick, ...props}) {
    const nowPage = useContext(PageContext);
    const wrapperStyle = {
        marginTop: `${props.showNavbar ? 72 : 24}px`
    };
    
    const listMarkers = useMemo(()=>{
        return markers.filter((marker) => {
            return location ? (marker.region === location) : true;
        }).map((marker) => {
            return (
                <ListMarker key={marker.id} marker={marker} onClick={onShowDetailClick}/>
            );
        });
    },[location, markers, onShowDetailClick]);

    return (
        <div className={nowPage === PAGES.LIST ? "" : "d-none"} style={wrapperStyle}>
            <ListGroup variant="flush">
                {listMarkers}
            </ListGroup>
        </div>

    );
})