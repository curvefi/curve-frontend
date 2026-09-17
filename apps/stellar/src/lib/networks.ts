export const STELLAR_NETWORKS = {
  stellar: {
    name: 'Stellar',
    chainId: 1500,
    isTestnet: false,
    isLite: true,
    nativeCurrency: {
      symbol: 'XLM',
      decimals: 7,
      address: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA' as const,
    },
    rpcUrl: 'https://rpc.ankr.com/stellar_soroban',
    explorerUrl: 'https://testnet.stellarchain.io/',
    factories: [],
  },
  'stellar-testnet': {
    name: 'Stellar testnet',
    chainId: 1501,
    isTestnet: true,
    isLite: true,
    nativeCurrency: {
      symbol: 'XLM',
      decimals: 7,
      address: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC' as const,
    },
    rpcUrl: 'https://soroban-testnet.stellar.org',
    explorerUrl: 'https://stellar.expert/explorer/testnet',
    factories: [
      'CCVQHSRUNDQWNWFXMLWASHGXRBMHTHOA6KZADILNB4XJC3WRYHOBIQPO',
      'CAWZ6CZ7VULEDEGSFBONISBGFH2HOXMYI2UEZXNQDJQ5LNYHFSMWFQCJ',
    ],
  },
} as const

export type StellarNetwork = keyof typeof STELLAR_NETWORKS
