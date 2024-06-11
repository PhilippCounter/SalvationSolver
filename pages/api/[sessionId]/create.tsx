import type { NextApiRequest, NextApiResponse } from 'next';
import { testSessionId } from '../../../services/session';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const fs = require('fs');
    const { sessionId } = req.query;

    if ( !testSessionId( Number(sessionId) ) ) {
        res.status(405).json( [ 'not allowed' ] );
        return;
    }

    fs.writeFileSync( '.storage/' + sessionId + '.json', JSON.stringify({
        created : new Date(),
        innerSymbols : {
            left : {
                main: undefined,
                symbols: [ undefined, undefined ],
            },
    
            middle : {
                main: undefined,
                symbols: [ undefined, undefined ],
            },
    
            right : {
                main: undefined,
                symbols: [ undefined, undefined ],
            },
        },
    }) );

    res.status(200).json( [ 'ok' ] );
    return;

}