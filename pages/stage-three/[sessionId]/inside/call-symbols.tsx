import { Container, Row, Col, Card, CardFooter, Form, Button } from 'react-bootstrap'
import React, { useEffect, useState } from "react";
import Link from 'next/link';

import { useRouter } from 'next/router';

import { testSessionId, getSessionData, SessionData } from '../../../../services/session';
import { Symbols, SymbolData } from '../../../../services/symbols';

import axios from 'axios';

const baseUrl = typeof Window === 'undefined' ? process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost' : '';

interface IProps {
    sessionId?: string
}

export default function Create( props: IProps ) {
    const router = useRouter();

    const [ sessionId, setSessionId ] = useState<string|undefined>(props.sessionId);
    const [ targetSide, setTargetSide ] = useState<string|undefined>();
    const [ targetSymbol, setTargetSymbol ] = useState<Symbols|undefined>();

    const [ wallSymbols, setWallSymbols ] = useState<Symbols[]>([]);

    const addWallSymbol = ( symbol ) => {
        let newWallSymbols = [ ...wallSymbols ];
        newWallSymbols.push( symbol );
        if ( newWallSymbols.length <= 2 ) setWallSymbols(newWallSymbols);
    }

    const removeWallSymbol = ( symbol ) => {
        let newWallSymbols = [ ...wallSymbols ];

        let index = newWallSymbols.findIndex( (el) => el == symbol );
        console.log( index );
        newWallSymbols.splice(index,1) 
        setWallSymbols(newWallSymbols);
    }

    const lockSymbols = async () => {
        let wasUpdated = ( await axios({
            method: 'POST',
            url: baseUrl + '/api/' + sessionId + '/update',
            data: {
                targetSide, 
                mainSymbol: targetSymbol, 
                shadowSymbols: wallSymbols
            },
        }) ).status == 200;

        router.push('/stage-four/' + sessionId + '/inside/' + targetSide + '/' + targetSymbol + '/results');
    }

    if ( !sessionId ) {
        return <Container>
            <Row className='p-2'>
                <Card className='p-0'>
                    <Card.Header>
                        Invalid session
                    </Card.Header>
                    <Card.Body>
                        <Row className='p-2'>
                            Unable to join session
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
                    Select the symbol ontop of your character
                </Card.Header>
                <Card.Body>
                    <Row className='pt-0'>
                        <Col>Current session:</Col><Col><Link href={'/stage-two/' + sessionId + '/role-select'}>{sessionId}</Link></Col>
                    </Row>
                    <Row className='p-2 pt-3'>
                        <Col>
                            <Button style={{width:'100%'}} className={ targetSide == 'left' ? 'bg-success' : '' } onClick={() => setTargetSide('left')}>Left</Button>
                        </Col>
                        <Col>
                            <Button style={{width:'100%'}} className={ targetSide == 'middle' ? 'bg-success' : '' } onClick={() => setTargetSide('middle')}>Middle</Button>
                        </Col>
                        <Col>
                            <Button style={{width:'100%'}} className={ targetSide == 'right' ? 'bg-success' : '' } onClick={() => setTargetSide('right')}>Right</Button>
                        </Col>
                    </Row>
                    <Row className='p-2 pt-3'>
                    <Col>
                            <Button style={{width:'100%'}} className={ targetSymbol == Symbols.CIRCLE ? 'bg-success' : '' } onClick={() => setTargetSymbol(Symbols.CIRCLE)}>Circle</Button>
                        </Col>
                        <Col>
                            <Button style={{width:'100%'}} className={ targetSymbol == Symbols.SQUARE ? 'bg-success' : '' } onClick={() => setTargetSymbol(Symbols.SQUARE)}>Square</Button>
                        </Col>
                        <Col>
                            <Button style={{width:'100%'}} className={ targetSymbol == Symbols.TRIANGLE ? 'bg-success' : '' } onClick={() => setTargetSymbol(Symbols.TRIANGLE)}>Triangle</Button>
                        </Col>
                    </Row>
                    
                </Card.Body>
            </Card>
        </Row>
        <Row className='p-2'>
            <Card className='p-0'>
                <Card.Header>
                    Select the symbols dropped by your knights
                </Card.Header>
                <Card.Body>
                    <Row className='p-2 pt-0'>
                        <Col><Button style={{width:'100%'}} onClick={() => addWallSymbol( Symbols.SQUARE )}>Square</Button></Col>
                        <Col><Button style={{width:'100%'}} onClick={() => addWallSymbol( Symbols.CIRCLE )}>Circle</Button></Col>
                        <Col><Button style={{width:'100%'}} onClick={() => addWallSymbol( Symbols.TRIANGLE )}>Triangle</Button></Col>
                    </Row>
                    <Row className='p-2 pt-4'>
                        { wallSymbols.map(( symbol, idx ) => {
                            return <Col key={ idx }><Button className="bg-success" style={{width:'100%'}} onClick={() => removeWallSymbol( symbol )}>{ SymbolData[ symbol ].text }</Button></Col>;
                        })}
                    </Row>
                </Card.Body>
                <Card.Footer>
                    <Row className='p-2 pt-3'>
                        <Col><Button style={{width:'100%'}} onClick={() => lockSymbols()}>Lock In</Button></Col>
                    </Row>
                </Card.Footer>
            </Card>
        </Row>
    </Container>
}

export async function getServerSideProps( { params }: any ) {
    const fs = require('fs');

    let validation = testSessionId( params.sessionId );
    if ( !validation ) return { props: {
        sessionId: undefined
    } };

    return { props: {
        sessionId: params.sessionId
    } };
}