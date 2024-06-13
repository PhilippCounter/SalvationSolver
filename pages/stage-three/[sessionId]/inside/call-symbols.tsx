import { Container, Row, Col, Card, CardFooter, Form, Button } from 'react-bootstrap'
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';

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
    const [ sessionData, setSessionData ] = useState<SessionData|undefined>();



    const addWallSymbol = ( symbol ) => {
        let newWallSymbols = [ ...wallSymbols ];
        newWallSymbols.push( symbol );
        if ( newWallSymbols.length <= 2 ) setWallSymbols(newWallSymbols);
    }

    const removeWallSymbol = ( symbol ) => {
        let newWallSymbols = [ ...wallSymbols ];

        let index = newWallSymbols.findIndex( (el) => el == symbol );
        newWallSymbols.splice(index,1) 
        setWallSymbols(newWallSymbols);
    }

    const lockSymbols = async () => {
        if ( targetSide && targetSymbol && wallSymbols.length > 0 ) {
            let wasUpdated = ( await axios({
                method: 'POST',
                url: baseUrl + '/api/' + sessionId + '/update',
                data: {
                    targetSide, 
                    mainSymbol: targetSymbol, 
                    shadowSymbols: wallSymbols
                },
            }) ).status == 200;
        }

        router.push('/stage-four/' + sessionId + '/inside/' + (targetSide || 'none') + '/' + (targetSymbol || 'none') + '/results');
    }

    /*
    const waitForAllPlayerData = async () => {
        let newSessionData = ( await axios({
            method: 'POST',
            url: baseUrl + '/api/' + sessionId + '/get',
            data: {},
        }) ).data as SessionData;

        let waitingForSymbols = Object.keys( newSessionData.innerSymbols ).filter( (side) => newSessionData.innerSymbols[side].main === undefined ).length;

        if ( waitingForSymbols >= 1 ) { 
            await delay(1000);
            await waitForAllPlayerData();
            return;
        }
    }

    useEffect(() => {
        waitForAllPlayerData();
    },[sessionId]);*/

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
                            <Button style={{width:'100%'}} className={ targetSymbol == Symbols.CIRCLE ? 'bg-success' : '' } onClick={() => setTargetSymbol(Symbols.CIRCLE)}>
                                <Image
                                    src={SymbolData[Symbols.CIRCLE]?.icon}
                                    width={25}
                                    height={25}
                                    alt={''}
                                />
                            </Button>
                        </Col>
                        <Col>
                            <Button style={{width:'100%'}} className={ targetSymbol == Symbols.SQUARE ? 'bg-success' : '' } onClick={() => setTargetSymbol(Symbols.SQUARE)}>
                                <Image
                                    src={SymbolData[Symbols.SQUARE]?.icon}
                                    width={25}
                                    height={25}
                                    alt={''}
                                />
                            </Button>
                        </Col>
                        <Col>
                            <Button style={{width:'100%'}} className={ targetSymbol == Symbols.TRIANGLE ? 'bg-success' : '' } onClick={() => setTargetSymbol(Symbols.TRIANGLE)}>
                                <Image
                                    src={SymbolData[Symbols.TRIANGLE]?.icon}
                                    width={25}
                                    height={25}
                                    alt={''}
                                />
                            </Button>
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
                        <Col><Button style={{width:'100%'}} onClick={() => addWallSymbol( Symbols.SQUARE )}>
                            <Image
                                src={SymbolData[Symbols.SQUARE]?.icon}
                                width={25}
                                height={25}
                                alt={''}
                            />    
                        </Button></Col>
                        <Col><Button style={{width:'100%'}} onClick={() => addWallSymbol( Symbols.CIRCLE )}>
                            <Image
                                src={SymbolData[Symbols.CIRCLE]?.icon}
                                width={25}
                                height={25}
                                alt={''}
                            />
                        </Button></Col>
                        <Col><Button style={{width:'100%'}} onClick={() => addWallSymbol( Symbols.TRIANGLE )}>
                            <Image
                                src={SymbolData[Symbols.TRIANGLE]?.icon}
                                width={25}
                                height={25}
                                alt={''}
                            /> 
                        </Button></Col>
                    </Row>
                    <Row className='p-2 pt-4'>
                        { wallSymbols.map(( symbol, idx ) => {
                            return <Col key={ idx }><Button className="bg-success" style={{width:'100%'}} onClick={() => removeWallSymbol( symbol )}>
                                <Image
                                    src={ SymbolData[ symbol ]?.icon }
                                    width={25}
                                    height={25}
                                    alt={''}
                                />
                            </Button></Col>;
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