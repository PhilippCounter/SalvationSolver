import { Container, Row, Col, Card, CardFooter, Form, Button } from 'react-bootstrap'
import React, { useState } from "react";

export default function Home() {
    return <Container>
        <Row>
            <Card className='p-0'>
                <Card.Header>
                    Salvation Solver
                </Card.Header>
                <Card.Body className='pt-4 pb-4'>
                    
                </Card.Body>
                <Card.Footer className='text-end'>
                    <Row>
                        <Col>
                                <Button>Solve</Button>
                        </Col>
                    </Row>
                </Card.Footer>
            </Card>
        </Row>
    </Container>
}