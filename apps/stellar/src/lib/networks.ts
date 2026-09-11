export const STELLAR_NETWORKS = {
  stellar: {
    name: 'Stellar',
    chainId: 1500,
    isTestnet: false,
    isLite: true,
    nativeCurrency: { symbol: 'XLM', decimals: 7 },
    rpcUrl: 'https://rpc.ankr.com/stellar_soroban',
  },
  'stellar-testnet': {
    name: 'Stellar testnet',
    chainId: 1501,
    isTestnet: true,
    isLite: true,
    nativeCurrency: { symbol: 'XLM', decimals: 7 },
    rpcUrl: 'https://soroban-testnet.stellar.org',
  },
}

export type StellarNetwork = keyof typeof STELLAR_NETWORKS
