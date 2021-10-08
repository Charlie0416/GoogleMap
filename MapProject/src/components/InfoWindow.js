import React from 'react';
import {Button, Card} from "react-bootstrap";

export default React.memo(function InfoWindow({marker, onShowDetailClick, imgUrl, defaultImgUrl}) {
    const handleImgError = (e) => {
        e.target.src = defaultImgUrl;
    };//當圖片報錯時，設為預設圖片
    return (
        <Card style={{width: '14rem'}}>
            <Card.Img variant="top" src={imgUrl} style={{height: '8rem'}} onError={handleImgError}/>
            <Card.Body>
                <Card.Title>{marker.name}</Card.Title>
                <Card.Text>
                    {marker.address}
                </Card.Text>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
                <Button variant="primary" size='sm'>加入最愛</Button>
                <Button variant="primary" size='sm' onClick={onShowDetailClick}>更多資訊</Button>
            </Card.Footer>
        </Card>
    );
})