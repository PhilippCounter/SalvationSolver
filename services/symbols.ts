export enum Symbols {
    TRIANGLE = 0,
    SQUARE   = 1,
    CIRCLE   = 2,
}

export const SymbolData = [
    { text: 'Triangle', link: '' },
    { text: 'Square', link: '' },
    { text: 'Circle', link: '' },
]

export type SymbolChange = {
    symbol: Symbols,
    target: keyof InnerSymbols
}

export type InnerSymbols = {
    left   : {
        main: Symbols
        symbols: Symbols[]
        output?: SymbolChange[]
    },
    middle : {
        main: Symbols
        symbols: Symbols[]
        output?: SymbolChange[]
    },
    right  : {
        main: Symbols
        symbols: Symbols[]
        output?: SymbolChange[]
    },
}

export const possible_symbols = [ Symbols.CIRCLE, Symbols.SQUARE, Symbols.TRIANGLE ];
export const possible_sides   = [ 'left', 'middle', 'right' ] as Array<keyof InnerSymbols>;