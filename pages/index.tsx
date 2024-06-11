import { Container, Row, Col, Card, CardFooter, Form, Button } from 'react-bootstrap';
import React, { useState } from "react";
import Link from 'next/link';



export default function Home() {
    return <Container>
        <Row className='p-2'>
            <Card className='p-0'>
                <Card.Header>
                    Salvation Solver
                </Card.Header>
                <Card.Body className='pt-4 pb-4'>
                    Create a session or join one that has been created for you.
                </Card.Body>
                <Card.Footer className='text-center'>

                                <Link href="/stage-one/create" ><Button style={{width:'40%'}}>Create</Button></Link>

                                <Link href="/stage-one/join" ><Button style={{width:'40%',marginLeft:'20px'}}>Join</Button></Link>

                </Card.Footer>
            </Card>
        </Row>
    </Container>
}