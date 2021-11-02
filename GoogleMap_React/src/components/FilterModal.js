import React, {useCallback, useMemo, useRef} from 'react';
import {Button, Col, Form, Modal} from "react-bootstrap";
import {Types as MarkerTypes} from "./Marker";

export default React.memo(function FilterModal({onFilterSave,onHide,typesFilterValue,starFilter,...props}) {
    const renderTypeChecks = useMemo(()=>{
        return Object.keys(MarkerTypes).map((typeName)=>{
            let type = MarkerTypes[typeName];
            return (
                <Col xs={4} key={typeName}>
                    <Form.Check custom inline type='checkbox' id={`type-${typeName}`}
                                label={type.description} defaultChecked={ (typesFilterValue & type.value) > 0 }
                                value={type.value}
                    />
                </Col>
            );
        });
    },[typesFilterValue]);
    const renderStarButtons = useMemo(()=>{
        return [5,4,3].map((star)=>{
            return (
                <Col xs={"auto"} key={star}>
                    <Form.Check custom inline type='radio' id={`star-${star}`}
                                label={star+" ★＋"} defaultChecked={star===starFilter}
                                name='star' value={star}
                    />
                </Col>
            );
        });
    },[starFilter]);

    const typesGroupRef = useRef();
    const starsGroupRef = useRef();

    const handleFilterSave = useCallback(()=>{
        let typesInputs = typesGroupRef.current.querySelectorAll('input:checked');
        let newTypesFilter = Array.from(typesInputs).map((input)=>{
            return parseInt(input.value);
        });

        let starInput = starsGroupRef.current.querySelector('input:checked');
        let newStarFilter = parseInt(starInput.value);

        onFilterSave({
            typesFilter: newTypesFilter,
            starFilter: newStarFilter
        });
    },[onFilterSave]);

    return (
        <Modal show={props.show} onHide={onHide} scrollable centered>
            <Modal.Header closeButton className='bg-light'>
                <div className='h5 modal-title'>景點篩選</div>
            </Modal.Header>
            <Modal.Body>
                <Form.Group ref={typesGroupRef}>
                    <Form.Row>
                        <Col xs={12}>
                            <Form.Label>類型</Form.Label>
                        </Col>
                        {renderTypeChecks}
                    </Form.Row>
                </Form.Group>
                <hr/>
                <Form.Group ref={starsGroupRef}>
                    <Form.Row>
                        <Col xs={12}>
                            <Form.Label>推薦指數</Form.Label>
                        </Col>
                        {renderStarButtons}
                    </Form.Row>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer className='bg-light'>
                <Button onClick={handleFilterSave} variant='primary'>儲存設定</Button>
                <Button onClick={onHide} variant='secondary'>關閉</Button>
            </Modal.Footer>
        </Modal>
    );
})