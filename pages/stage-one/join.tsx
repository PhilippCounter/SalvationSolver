import { Container, Row, Col, Card, CardFooter, Form, Button } from 'react-bootstrap'
import React, { useState } from "react";
import Link from 'next/link';


export default function Join() {

    const [ sessionId, setSessionId ] = useState<string>("");

    return <Container>
        <Row className='p-2'>
            <Card className='p-0'>
                <Card.Header>
                    Join an existing session
                </Card.Header>
                <Card.Body>
                    <Row className='p-2'>
                        Enter the number you got from your host below
                    </Row>
                    <Row className='pt-3'>
                        <Col><Form.Control onChange={(el) => setSessionId(el.target.value)} /></Col>
                    </Row>
                </Card.Body>
                <Card.Footer className='text-center'>
                    <Link href={'/stage-two/' + sessionId + '/role-select'}><Button style={{width:'40%'}}>Join</Button></Link>
                </Card.Footer>
            </Card>
        </Row>
    </Container>
}