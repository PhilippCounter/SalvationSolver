import { InnerSymbols } from './symbols';

export type SessionData = {
    created      : Date,
    innerSymbols : InnerSymbols,

}

const sessionNumberLength = Number(process.env.SESSION_NUMBER_LENGTH);
const secretNumber        = Number(process.env.SECRET_NUMBER);

export const getRandomSessionId = () => {
    const sessionNumber = Math.floor( Number( "1" + "0".repeat(sessionNumberLength-1) )  + Math.random() * Number( "1" + "0".repeat(sessionNumberLength-1) ));
    return Number(sessionNumber + "" + (sessionNumber % secretNumber));
}

export const testSessionId = ( sessionId : number ) => {
    const sessionNumber = (sessionId + "").slice( 0, sessionNumberLength );
    const secretTest    = (sessionId + "").slice( sessionNumberLength );

    return Number(sessionNumber) % secretNumber == Number(secretTest);
}

export const getSessionData = ( fs : any, sessionId : number ) : SessionData => {
    if ( fs.existsSync('.storage/' + sessionId + '.json') ) { 
        return JSON.parse( fs.readFileSync( '.storage/' + sessionId + '.json', 'UTF-8' ) );
    }
}