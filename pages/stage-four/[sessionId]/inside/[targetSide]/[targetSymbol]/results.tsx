import { Container, Row, Col, Card, CardFooter, Form, Button } from 'react-bootstrap'
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';

import { useRouter } from 'next/router';

import { testSessionId, getSessionData, SessionData } from '../../../../../../services/session';
import { Symbols, SymbolData, InnerSymbols, possible_sides } from '../../../../../../services/symbols';

import axios from 'axios';

const baseUrl = typeof Window === 'undefined' ? process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost' : '';

interface IProps {
    sessionId?: string,
    targetSide: keyof InnerSymbols,
    targetSymbol: Symbols
}

export default function Create( props: IProps ) {
    const router = useRouter();

    const [ sessionId, setSessionId ] = useState<string|undefined>(props.sessionId);
    const [ sessionData, setSessionData ] = useState<SessionData|undefined>();
    const [ targetSide, setTargetSide ] = useState<keyof InnerSymbols|"none">(props.targetSide);
    const [ targetSymbol, setTargetSymbol ] = useState<Symbols|"none">(props.targetSymbol);

    const [ playerSelection, setPlayerSelection ] = useState<any>();

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

    const delay = millis => new Promise((resolve, reject) => {
        setTimeout(_ => resolve(undefined), millis)
    });

    const waitForAllPlayerData = async () => {
        let newSessionData = ( await axios({
            method: 'POST',
            url: baseUrl + '/api/' + sessionId + '/get',
            data: {},
        }) ).data as SessionData;

        let waitingForSymbols = Object.keys( newSessionData.innerSymbols ).filter( (side) => newSessionData.innerSymbols[side].main === undefined ).length;

        setPlayerSelection( newSessionData.innerSymbols[targetSide] );

        if ( waitingForSymbols >= 2 ) { 
            await delay(1000);
            await waitForAllPlayerData();
            return;
        }

        let called_symbols = newSessionData.innerSymbols;


        if ( waitingForSymbols == 1 ) {
            let possible_sides   = [ 'left', 'middle', 'right' ] as Array<keyof InnerSymbols>;
            let possible_mains   = [ Symbols.CIRCLE, Symbols.SQUARE, Symbols.TRIANGLE ];
            let possible_symbols = [ Symbols.CIRCLE, Symbols.CIRCLE, Symbols.SQUARE, Symbols.SQUARE, Symbols.TRIANGLE, Symbols.TRIANGLE ];

            Object.keys( called_symbols ).forEach( ( side : keyof InnerSymbols ) => {
                if ( called_symbols[side].main ) {
                    possible_sides.splice( possible_sides.indexOf(side), 1 );
                    possible_mains.splice( possible_mains.indexOf(called_symbols[side].main), 1 );
                    called_symbols[side].symbols.forEach( ( symbol ) => {
                        possible_symbols.splice( possible_symbols.indexOf( symbol ), 1 );
                    } )
                }
            } );

            if ( targetSide == 'none' ) {
                setTargetSide( possible_sides[0] );
                setTargetSymbol( possible_mains[0] );
            }

            called_symbols[possible_sides[0]].main    = possible_mains[0];
            called_symbols[possible_sides[0]].symbols = possible_symbols;
        } 

        let side_calls = Object.keys( called_symbols ) as Array<keyof InnerSymbols>;

        side_calls.forEach( ( own_side : keyof InnerSymbols ) => {
            let side_call = called_symbols[own_side];
            let changeable_symbol = side_call.symbols.filter( ( wall_symbol ) => wall_symbol != side_call.main );

            if ( changeable_symbol.length < 1 ) {
                called_symbols[own_side]['output'] = 
                    possible_sides
                        .filter( ( target_side ) => target_side != own_side )
                        .map( ( target_side ) => ({ 
                            symbol: side_call.main,
                            target: target_side
                        }) )
                
            } else if ( changeable_symbol.length < 2 ) {
                let match_target = side_calls.filter( ( side ) => {
                    let call = called_symbols[side];
                    return call.main != side_call.main && call.main == changeable_symbol[0] 
                } )[0];

                let non_match_target = side_calls.filter( ( side ) => {
                    let call = called_symbols[side];
                    return call.main != side_call.main && call.main != changeable_symbol[0] 
                } )[0];
                
                called_symbols[own_side]['output'] = [
                    {
                        symbol: side_call.main,
                        target : match_target
                    },
                    {
                        symbol : changeable_symbol[0],
                        target : non_match_target
                    }
                ];
            } else {
                let non_match_target_a = side_calls.filter( ( side ) => {
                    let call = called_symbols[side];
                    return call.main != side_call.main && call.main != changeable_symbol[0] 
                } )[0];

                let non_match_target_b = side_calls.filter( ( side ) => {
                    let call = called_symbols[side];
                    return call.main != side_call.main && call.main != changeable_symbol[1] 
                } )[0];

                if ( non_match_target_a == non_match_target_b ) {
                    called_symbols[own_side]['output'] = 
                        possible_sides
                            .filter( ( target_side ) => target_side != own_side )
                            .map( ( target_side ) => ({ 
                                symbol: side_call.main,
                                target: target_side
                            }) )
                } else {
                    called_symbols[own_side]['output'] = [
                        {
                            symbol: changeable_symbol[0],
                            target : non_match_target_a
                        },
                        {
                            symbol: changeable_symbol[1],
                            target : non_match_target_b
                        }
                    ];
                }
            }
        });

        newSessionData.innerSymbols = called_symbols;
        setSessionData( newSessionData );
    }

    const resetSymbols = async () => {
        let wasResetted = ( await axios({
            method: 'POST',
            url: baseUrl + '/api/' + sessionId + '/create',
            data: { },
        }) ).status == 200;

        if ( wasResetted ) {
            router.push('/stage-two/' + sessionId + '/role-select');
        }
    }

    useEffect(() => {
        waitForAllPlayerData();
    },[sessionId]);

    if ( !sessionData || !sessionData.innerSymbols ) {
        return <Container>
            <Row className='p-2'>
                <Card className='p-0'>
                    <Card.Header>
                        Waiting for other players
                    </Card.Header>
                    <Card.Body>
                        <Row className='pt-0'>
                            <Col>Current session:</Col><Col><Link href={'/stage-two/' + sessionId + '/role-select'}>{sessionId}</Link></Col>
                        </Row>
                        <Row className='p-2 pt-3'>
                            { playerSelection && <div>
                                your symbol:<br/>
                                <Button><Image
                                    src={SymbolData[playerSelection.main]?.icon}
                                    width={25}
                                    height={25}
                                    alt={''}
                                /></Button>
                            </div> }
                        </Row>
                        <Row className='p-2 pt-3'>
                            { playerSelection && <div>
                                your selection:<br/>
                                { playerSelection.symbols.map( (symbol) => <Button style={{marginRight: '10px'}}>
                                    <Image
                                        src={SymbolData[symbol]?.icon}
                                        width={25}
                                        height={25}
                                        alt={''}
                                    />
                                </Button> 
                                )}
                            </div> }
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
                    Result
                </Card.Header>
                <Card.Body>
                    <Row className='pt-0'>
                        <Col>Current session:</Col><Col><Link href={'/stage-two/' + sessionId + '/role-select'}>{sessionId}</Link></Col>
                    </Row>
                    <Row className='p-2 pt-3'>
                        <Col>
                            <table>
                                { targetSide != 'none' && targetSymbol != 'none' && sessionData.innerSymbols[targetSide].output.map(( output, idx ) => {
                                    return <tr key={ idx } style={{ height: '80px' }}>
                                        <td><Button style={{ height: '70px', width: '70px' }}>
                                                <Image
                                                    src={SymbolData[output.symbol]?.icon}
                                                    width={25}
                                                    height={25}
                                                    alt={''}
                                                />
                                        </Button></td> 
                                        <td style={{ width: '50px', textAlign: 'center' }}>→</td>
                                        <td><Button style={{ height: '70px', width: '80px' }}>
                                                {output.target}<br/>
                                                <Image
                                                    src={SymbolData[sessionData.innerSymbols[output.target].main]?.icon}
                                                    width={25}
                                                    height={25}
                                                    alt={''}
                                                />
                                        </Button></td> 
                                    </tr>
                                }) }
                            </table>
                        </Col>
                    </Row>
                </Card.Body>
                <Card.Footer>
                    <Row className='p-2 pt-3'>
                        <Col><Button style={{width:'100%'}} onClick={() => resetSymbols()}>next round</Button></Col>
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
        sessionId: params.sessionId,
        targetSide: params.targetSide,
        targetSymbol: params.targetSymbol
    } };
}