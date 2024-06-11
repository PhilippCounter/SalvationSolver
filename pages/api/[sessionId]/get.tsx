import type { NextApiRequest, NextApiResponse } from 'next';
import { testSessionId, getSessionData } from '../../../services/session';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const fs = require('fs');
    const { sessionId } = req.query;
    const { targetSide, mainSymbol, shadowSymbols } = req.body;

    if ( !testSessionId( Number(sessionId) ) ) {
        res.status(405).json( [ 'not allowed' ] );
        return;
    }

    let currentSessionData = getSessionData( fs, Number(sessionId) );
    res.status(200).json(currentSessionData);
    return;

}