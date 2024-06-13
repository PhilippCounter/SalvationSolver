import { Container, Row, Col, Card, CardFooter, Form, Button } from 'react-bootstrap'
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';

import { useRouter } from 'next/router';

import { testSessionId, getSessionData, SessionData } from '../../../../services/session';
import { Symbols, SymbolData, InnerSymbols, possible_sides } from '../../../../services/symbols';

import axios from 'axios';

const baseUrl = typeof Window === 'undefined' ? process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost' : '';


const shapeLibrary = {
    'sphere' : {
        combination : [ Symbols.CIRCLE, Symbols.CIRCLE ],
        name        : 'Sphere',
        identifier  : 'sphere',
        author      : 'https://www.flaticon.com/authors/pixel-perfect',
    },
    'cube' : {
        combination : [ Symbols.SQUARE, Symbols.SQUARE ],
        name        : 'Cube',
        identifier  : 'cube',
        author      : 'https://www.freepik.com/',
    },
    'pyramid' : {
        combination : [ Symbols.TRIANGLE, Symbols.TRIANGLE ],
        name        : 'Pyramid',
        identifier  : 'pyramid',
        author      : 'https://www.flaticon.com/authors/deemakdaksina',
    },
    'cylinder' : {
        combination : [ Symbols.SQUARE, Symbols.CIRCLE ],
        name        : 'Cylinder',
        identifier  : 'cylinder',
        author      : 'https://www.flaticon.com/authors/xinh-studio',
    },
    'prism' : {
        combination : [ Symbols.TRIANGLE, Symbols.SQUARE ],
        name        : 'Prism',
        identifier  : 'prism',
        author      : 'https://www.freepik.com/',
    },
    'cone' : {
        combination : [ Symbols.TRIANGLE, Symbols.CIRCLE ],
        name        : 'Cone',
        identifier  : 'cone',
        author      : 'https://thenounproject.com/creator/kozinn/',
    },
}

interface IProps {
    sessionId?: string,
    targetSide: keyof InnerSymbols,
    targetSymbol: Symbols
}
type Shape = {
    combination : Symbols[],
    name : string,
}

type OuterShapes = {
    left: Shape,
    middle: Shape,
    right: Shape
}

export default function Create( props: IProps ) {
    const router = useRouter();

    const [ sessionId, setSessionId ] = useState<string|undefined>(props.sessionId);
    const [ sessionData, setSessionData ] = useState<SessionData|undefined>();

    const [ sessionShapes, setSessionShapes ] = useState<OuterShapes|undefined>();

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

    const updateSessionShapes = ( side, shapeName ) => {
        let newSessionShapes = { ...sessionShapes };
        newSessionShapes[side] = shapeLibrary[shapeName];
        setSessionShapes( newSessionShapes );
    }


    const calculateInputSteps = () => {

        if ( !sessionShapes || !sessionShapes.left || !sessionShapes.middle || !sessionShapes.right ) return [];

        let mainSymbols   = [ sessionData.innerSymbols.left.main, sessionData.innerSymbols.middle.main, sessionData.innerSymbols.right.main ] as Symbols[];

        let shapeSymbols = [
            [ sessionShapes.left.combination[0],   sessionShapes.left.combination[1],   ],
            [ sessionShapes.middle.combination[0], sessionShapes.middle.combination[1], ],
            [ sessionShapes.right.combination[0],  sessionShapes.right.combination[1],  ]
        ] as Symbols[][];


        let symbolCount = [ 0, 0, 0 ];

        for ( let shapeSymbolSide of shapeSymbols ) {
            for ( let shapeSymbol of shapeSymbolSide ) {
                symbolCount[shapeSymbol]++; 
            }
        }


        if ( symbolCount.findIndex( (counter) => counter != 2 ) >= 0 ) return []; 



        let outputChangeLog = [] as Symbols[][];

        let changes = runShapeTransferCheck(mainSymbols, shapeSymbols);

        let counter = 0;
        while ( changes.length > 0 || counter < 5 ) {

            outputChangeLog = [ ...outputChangeLog, ...changes ]; 


            // apply change
            for ( let change of changes ) {
                
                let originShapeIndex = mainSymbols.indexOf( change[0] );
                let targetShapeIndex = mainSymbols.indexOf( change[2] );

                let originShapeSymbolIndex = shapeSymbols[ originShapeIndex ].indexOf( change[1] );
                let targetShapeSymbolIndex = shapeSymbols[ targetShapeIndex ].indexOf( change[3] );

                let originSymbol = shapeSymbols[ originShapeIndex ][ originShapeSymbolIndex ];
                let targetSymbol = shapeSymbols[ targetShapeIndex ][ targetShapeSymbolIndex ];

                shapeSymbols[ originShapeIndex ][ originShapeSymbolIndex ] = targetSymbol;
                shapeSymbols[ targetShapeIndex ][ targetShapeSymbolIndex ] = originSymbol;

            }            

            changes = runShapeTransferCheck(mainSymbols, shapeSymbols);
            counter++;
        }

        return outputChangeLog;
    }


    const runShapeTransferCheck = ( mainSymbols, shapeSymbols ) => {
        let changes = [] as Symbols[][];
        let index = 0;

        for ( let shapeSymbolSide of shapeSymbols ) {
            let freeSymbols = shapeSymbolSide.filter( ( shapeSymbol ) => shapeSymbol == mainSymbols[index] );

            // fix for duplicate shapes ( cube, shpere, pyramid )
            if ( freeSymbols.length == 0 && shapeSymbolSide[0] == shapeSymbolSide[1] ) {
                freeSymbols = [ shapeSymbolSide[0] ];
            }

            for( let freeSymbol of freeSymbols ) {

                let innerIndex = 0;
                for ( let mainSymbol of mainSymbols ) {

                    if ( mainSymbol == mainSymbols[index] ) {
                        innerIndex++;
                        continue; 
                    }
 
                    // find a target
                    if ( 
                        // that is not already in the origin shape
                        freeSymbol != mainSymbol && 
                        // that is not the same as the origin shape symbol
                        shapeSymbols[innerIndex].findIndex(( shapeSymbol ) => mainSymbols[index] != shapeSymbol ) >= 0
                    ) {

                        
                        // find a symbol in the target shape
                        let targetFreeSymbols = shapeSymbols[innerIndex].filter(( shapeSymbol ) =>  
                            // that is not the same as the origin shape symbol
                            mainSymbols[index] != shapeSymbol && 
                            // that is not already in the origin shape
                            shapeSymbolSide.findIndex(( innerShapeSymbol ) => shapeSymbol == innerShapeSymbol ) < 0 &&
                            // that is not required for the target shape
                            mainSymbol == shapeSymbol
                        )

                        // fix for duplicate shapes ( cube, shpere, pyramid )
                        if ( targetFreeSymbols.length == 0 && shapeSymbols[innerIndex][0] == shapeSymbols[innerIndex][1] ) {
                            targetFreeSymbols = [ shapeSymbols[innerIndex][0] ];
                        } 

                        if ( !targetFreeSymbols.length ) continue;

                        changes.push( [  mainSymbol, targetFreeSymbols[0], mainSymbols[index], freeSymbol ] );
                        return changes;
                    }
                    innerIndex++;
                }

            }
            index++;

        } 

        return changes;
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

    const getSideByMainSymbol = ( symbol ) => {
        return Object.keys( sessionData.innerSymbols ).filter( ( side ) => sessionData.innerSymbols[side].main == symbol );
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
                        { Object.keys(sessionData.innerSymbols).map(( side ) => {
                            return <Col>
                                <Button style={{width:'100%'}} className="bg-success">
                                    { side }<br/>
                                    <Image
                                        src={SymbolData[ sessionData.innerSymbols[side].main ]?.icon}
                                        width={25}
                                        height={25}
                                        alt={sessionData.innerSymbols[side].text}
                                    />
                                </Button>
                                <Row className='p-0 pt-2'>
                                    <Col className='pt-1'><Button style={{width:'100%'}} className={ sessionShapes && sessionShapes[side] && sessionShapes[side].identifier == 'sphere' ? 'bg-success' : '' } onClick={ () => updateSessionShapes(side, 'sphere') }>
                                        <Image
                                            src={"/icons/sphere.png"}
                                            width={50}
                                            height={50}
                                            alt={ shapeLibrary['sphere'].author }
                                        />
                                    </Button></Col>
                                    <Col className='pt-1'><Button style={{width:'100%'}} className={ sessionShapes && sessionShapes[side] && sessionShapes[side].identifier == 'cube' ? 'bg-success' : '' } onClick={ () => updateSessionShapes(side, 'cube') }>
                                        <Image
                                            src={"/icons/cube.png"}
                                            width={50}
                                            height={50}
                                            alt={ shapeLibrary['cube'].author }
                                        />
                                    </Button></Col>
                                    <Col className='pt-1'><Button style={{width:'100%'}} className={ sessionShapes && sessionShapes[side] && sessionShapes[side].identifier == 'pyramid' ? 'bg-success' : '' } onClick={ () => updateSessionShapes(side, 'pyramid') }>
                                        <Image
                                            src={"/icons/pyramid.png"}
                                            width={50}
                                            height={50}
                                            alt={ shapeLibrary['pyramid'].author }
                                        />
                                    </Button></Col>
                                </Row>
                                <Row className='p-0 pt-1'>
                                    <Col className='pt-1'><Button style={{width:'100%'}} className={ sessionShapes && sessionShapes[side] && sessionShapes[side].identifier == 'cylinder' ? 'bg-success' : '' } onClick={ () => updateSessionShapes(side, 'cylinder') }>
                                        <Image
                                            src={"/icons/cylinder.png"}
                                            width={50}
                                            height={50}
                                            alt={ shapeLibrary['cylinder'].author }
                                        />
                                    </Button></Col>
                                    <Col className='pt-1'><Button style={{width:'100%'}} className={ sessionShapes && sessionShapes[side] && sessionShapes[side].identifier == 'prism' ? 'bg-success' : '' } onClick={ () => updateSessionShapes(side, 'prism') }>
                                        <Image
                                            src={"/icons/prism.png"}
                                            width={50}
                                            height={50}
                                            alt={ shapeLibrary['prism'].author }
                                        />
                                    </Button></Col>
                                    <Col className='pt-1'><Button style={{width:'100%'}} className={ sessionShapes && sessionShapes[side] && sessionShapes[side].identifier == 'cone' ? 'bg-success' : '' } onClick={ () => updateSessionShapes(side, 'cone') }>
                                        <Image
                                            src={"/icons/cone.png"}
                                            width={50}
                                            height={50}
                                            alt={ shapeLibrary['cone'].author }
                                        />
                                    </Button></Col>
                                </Row>
                            </Col>
                        }) }

                        
                    </Row>
                    <Row className='p-2 pt-3'>
                        <table style={{ borderCollapse: 'collapse' }}>
                            {calculateInputSteps().map( ( entrie, idx ) => 
                                <tr key={idx} style={{ height: '45px', border: '1px solid' }}>
                                    <td style={{ padding: '10px' }}>
                                        {idx+1}
                                    </td>
                                    <td>
                                        <Button className='p-1' ><Image
                                            src={SymbolData[entrie[3]]?.icon}
                                            width={25}
                                            height={25}
                                            alt={ '' }
                                        /></Button>
                                    </td>
                                    <td>
                                        →
                                    </td>
                                    <td>
                                        <Button className='p-1' >{getSideByMainSymbol(entrie[2])}</Button>
                                    </td>
                                    <td></td>
                                    <td>
                                        <Button className='p-1' ><Image
                                            src={SymbolData[entrie[1]]?.icon}
                                            width={25}
                                            height={25}
                                            alt={ '' }
                                        /></Button>
                                    </td>
                                    <td>
                                        →
                                    </td>
                                    <td>
                                        <Button className='p-1' >{getSideByMainSymbol(entrie[0])}</Button>
                                    </td>
                                    
                                </tr> 
                            )}
                        </table>
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
        sessionId: params.sessionId
    } };
}