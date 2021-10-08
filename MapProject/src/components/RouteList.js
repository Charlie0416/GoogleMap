import React from 'react';
import { Button, Modal, ListGroup, Container } from "react-bootstrap";

export default React.memo(function RouteList({ show, ...props }) {
    let dis;
    if (show) {
        dis = 'block';
    }
    else {
        dis = 'none';
    }
    return (

        <Container
            style={{
                display: dis,
                position: "fixed",
                zIndex: 1,
                height: "250px",
                width: "100%",
                bottom: "2%",
                margin: 0,
                padding: 0,
            }}
        >
            <Modal.Dialog scrollable centered
                style={{
                    margin: 0,
                    height: "100%",
                }}
            >
                <Modal.Header className='bg-light'>
                    <div>功能選擇</div>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup className='text-center' variant={"flush"}>
                        <ListGroup.Item >景點地圖</ListGroup.Item>
                        <ListGroup.Item >景點列表</ListGroup.Item>
                        <ListGroup.Item >推薦路線</ListGroup.Item>
                        <ListGroup.Item >路線規劃</ListGroup.Item>
                        <ListGroup.Item >路線規劃</ListGroup.Item>
                        <ListGroup.Item >路線規劃</ListGroup.Item>
                        <ListGroup.Item >路線規劃</ListGroup.Item>
                        <ListGroup.Item >路線規劃</ListGroup.Item>
                        <ListGroup.Item >路線規劃</ListGroup.Item>
                    </ListGroup>
                </Modal.Body>
            </Modal.Dialog>
        </Container>

    )
})