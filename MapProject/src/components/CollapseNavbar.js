import React from 'react';
import {Button, Col, Collapse, Container, Navbar, Row} from "react-bootstrap";

export default React.memo(function CollapseNavbar({show, ...props}) {
    return (
        <Container fluid className='fixed-top'>
            <Row>
                <Collapse in={show} timeout={0}>
                    <Navbar className='w-100 justify-content-between no-gutters' bg='light'>
                        <Col xs={"auto"}>
                            <Button variant='info' onClick={props.onPagesClick} size='sm'>
                                功能表
                            </Button>
                        </Col>
                        <Col xs={"auto"}>
                            <Button variant='info' onClick={props.onFilterClick} size='sm'>
                                篩選
                            </Button>
                        </Col>
                        <Col xs={"auto"} md={2} id='location-dropdown-col'/>
                        <Col xs={"auto"}>
                            <Button variant='info' onClick={props.onHomeClick} size='sm'>
                                首頁
                            </Button>
                        </Col>
                    </Navbar>
                </Collapse>
                <div className={'px-4 bg-light mx-auto rounded-bottom'}
                     onClick={props.onCollapseClick}
                >
                    {show ? '▲' : '▼'}
                </div>
            </Row>
        </Container>
    );
});