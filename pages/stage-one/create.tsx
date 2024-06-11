import { Container, Row, Col, Card, CardFooter, Form, Button } from 'react-bootstrap'
import React, { useState } from "react";
import Link from 'next/link';
import { getRandomSessionId, testSessionId } from '../../services/session';
import axios, { AxiosPromise } from 'axios';

const baseUrl = typeof Window === 'undefined' ? process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost' : '';

interface IProps {
    sessionId?: string,
}

export default function Create( props: IProps ) {

    const [ sessionId, setSessionId ] = useState<string|undefined>(props.sessionId);

    if ( !sessionId ) {
        return <Container>
            <Row className='p-2'>
                <Card className='p-0'>
                    <Card.Header>
                        Invalid session
                    </Card.Header>
                    <Card.Body>
                        <Row className='p-2'>
                            Unable to create new session
                        </Row>
                    </Card.Body>
                </Card>
            </Row>
        </Container>
    }

    return <Container>
        <Row className='p-2'>
            <Card className='p-0'>
                <Card.Header>
                    Sucessfully created a session 
                </Card.Header>
                <Card.Body>
                    <Row className='p-2'>
                        Share this hotlink with your friends or tell them to enter the number below.<br/>(Your session will be deleted after 1 day)
                    </Row>
                    <Row className='pt-3'>
                        <Col>Your Session:</Col><Col><Link href={'/stage-two/' + sessionId + '/role-select'}>{sessionId}</Link></Col>
                    </Row>
                </Card.Body>
                <Card.Footer className='text-center'>
                    <Link href={'/stage-two/' + sessionId + '/role-select'}><Button style={{width:'40%'}}>Start</Button></Link>
                </Card.Footer>
            </Card>
        </Row>
    </Container>
}

export async function getServerSideProps( context: any ) {

    const newSessionId = getRandomSessionId();

    let wasCreated = ( await axios({
        method: 'POST',
        url: baseUrl + '/api/' + newSessionId + '/create',
        data: { },
    }) ).status == 200;

    return { props: {
        sessionId: wasCreated ? newSessionId : undefined,
    } };
}