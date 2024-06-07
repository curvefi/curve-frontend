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
    userCollateral: string
    userBorrowed: string
    debt: string
    createUrl: string
    createLeverageUrl: string
    manageLoanUrl: string
    manageCollateralUrl: string
    manageLeverageUrl: string
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
    userCollateralTokenToAllocate: string
    userBorrowedTokenToAllocate: string
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

declare module '@/fixtures/networks.json' {
  export interface Network {
    id: number
    alias: string
    name: string
    infura_rpc: string
    alchemy_rpc: string
    fork_block: number
  }

  export interface Networks {
    [key: string]: Network
  }

  const value: Networks
  export default value
}
