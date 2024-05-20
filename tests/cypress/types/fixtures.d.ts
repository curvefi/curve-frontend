declare module '@/fixtures/whales.json' {
  export interface Whales {
    [alias: string]: {
      [key: string]: string[]
    }
  }

  const value: Whales
  export default value
}

declare module '@/fixtures/markets.json' {
  export interface Market {
    id: string
    collateral: string
    borrow: string
    url: string
  }

  export interface Markets {
    [alias: string]: {
      [key: string]: Market
    }
  }

  const value: Markets
  export default value
}

declare module '@/fixtures/create-loan-settings.json' {
  export interface LoanSetting {
    ethersToAllocate: string
    collateralTokenToAllocate: string
  }

  export interface LoanSettings {
    [alias: string]: {
      [key: string]: LoanSetting
    }
  }

  const value: LoanSettings
  export default value
}

declare module '@/fixtures/tokens.json' {
  export interface Token {
    address: string
    decimals: number
    symbol: string
    name: string
  }

  export interface Tokens {
    [alias: string]: {
      [key: string]: Token
    }
  }

  const value: Tokens
  export default value
}

declare module '@/fixtures/chains.json' {
  export interface Chain {
    id: number
    alias: string
    name: string
  }

  export interface Chains {
    [key: number]: Chain
  }

  const value: Chains
  export default value
}
