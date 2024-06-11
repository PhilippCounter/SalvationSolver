import { Container, Row, Col, Card, CardFooter, Form, Button } from 'react-bootstrap'
import React, { useState } from "react";
import Link from 'next/link';

interface IProps {
    sessionId: string,
}

export default function Create( props: IProps ) {

    const [ sessionId, setSessionId ] = useState<string>(props.sessionId);

    return <Container>
        <Row className='p-2'>
            <Card className='p-0'>
                <Card.Header>
                    Select the role you are playing
                </Card.Header>
                <Card.Body>
                    <Row className='pt-0'>
                        <Col>Current session:</Col><Col><Link href={'/stage-two/' + sessionId + '/role-select'}>{sessionId}</Link></Col>
                    </Row>
                    <Row className='p-2 pt-4'>
                        <Col><Link href={'/stage-two/role-select?session_id=' + sessionId}><Button style={{width:'80%'}}>Solo Room</Button></Link></Col>
                        <Col><Link href={'/stage-two/role-select?session_id=' + sessionId}><Button style={{width:'80%'}}>Outside</Button></Link></Col>
                    </Row>
                </Card.Body>
            </Card>
        </Row>
    </Container>
}

export async function getServerSideProps( { params }: any ) {
    return { props: {
        sessionId: params.sessionId,
    } };
}