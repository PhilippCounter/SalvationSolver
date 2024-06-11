import { Container, Row, Col, Card, CardFooter, Form, Button } from 'react-bootstrap'
import React, { useEffect, useState } from "react";
import Link from 'next/link';

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

    const waitForAllPlayerData = async () => {
        let newSessionData = ( await axios({
            method: 'POST',
            url: baseUrl + '/api/' + sessionId + '/get',
            data: {},
        }) ).data as SessionData;

        let waitingForSymbols = Object.keys( newSessionData.innerSymbols ).filter( (side) => newSessionData.innerSymbols[side].main === undefined ).length;

        if ( waitingForSymbols >= 1 ) return;

        let called_symbols = newSessionData.innerSymbols;
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
                    </Card.Body>
                </Card>
            </Row>
        </Container>
    }

    console.log( sessionData.innerSymbols );

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
                            { sessionData.innerSymbols[props.targetSide].output.map(( output, idx ) => {
                                return <div key={ idx } style={{ marginBottom: '15px' }}>
                                    <Button>{ SymbolData[output.symbol].text }</Button> → <Button>{ SymbolData[sessionData.innerSymbols[output.target].main].text }</Button>
                                </div>
                            }) }
                        </Col>
                    </Row>
                </Card.Body>
                <Card.Footer>
                    <Row className='p-2 pt-3'>
                        <Col><Button style={{width:'100%'}} onClick={() => resetSymbols()}>Reset all symbols</Button></Col>
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