import React from 'react';
import {Button, ListGroup, Modal} from "react-bootstrap";
import {PAGES} from "../App";


export default React.memo(function PagesModal({show,onHide,onPageSelect,...props}){
    return (
        <Modal show={show} onHide={onHide} scrollable centered
               size="sm" aria-labelledby="example-modal-sizes-title-sm"
        >
            <Modal.Header closeButton className='bg-light'>
                <div className='h5 modal-title'>功能選擇</div>
            </Modal.Header>
            <Modal.Body className='p-0'>
                {/*此處onSelect可查看 https://react-bootstrap.github.io/components/list-group/#list-group-props */}
                <ListGroup className='text-center' variant={"flush"} onSelect={onPageSelect}>
                    <ListGroup.Item eventKey={PAGES.MAP}>景點地圖</ListGroup.Item>
                    <ListGroup.Item eventKey={PAGES.LIST}>景點列表</ListGroup.Item>
                    <ListGroup.Item eventKey={PAGES.RECOMMEND}>推薦路線</ListGroup.Item>
                    <ListGroup.Item eventKey={PAGES.PLANNING}>路線規劃</ListGroup.Item>
                </ListGroup>
            </Modal.Body>
            <Modal.Footer className='bg-light'>
                <Button onClick={onHide} variant='secondary'>關閉</Button>
            </Modal.Footer>
        </Modal>
    );
})