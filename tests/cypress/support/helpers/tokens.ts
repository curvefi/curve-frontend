import { oneOf } from '@/support/generators'
import type { Address } from '@curvefi/prices-api'

type Token = {
  symbol: string
  address: Address
  chain: string
  usdPrice: number | null
}

const TOKENS: Token[] = [
  {
    symbol: 'XAUM',
    address: '0x2103E845C5E135493Bb6c2A4f0B8651956eA8682',
    chain: 'ethereum',
    usdPrice: 2902.343145,
  },
  {
    symbol: 'crvUSD',
    address: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
    usdPrice: null,
    chain: 'ethereum',
  },
  {
    symbol: 'RCH',
    address: '0x57B96D4aF698605563A4653D882635da59Bf11AF',
    chain: 'ethereum',
    usdPrice: null,
  },
  {
    symbol: 'ynETH',
    address: '0x09db87A538BD693E9d08544577d5cCfAA6373A48',
    chain: 'ethereum',
    usdPrice: 2752.2723186980897,
  },
  {
    symbol: 'USD0USD0++',
    address: '0x1d08E7adC263CfC70b1BaBe6dC5Bb339c16Eec52',
    chain: 'ethereum',
    usdPrice: 0.955776793088862,
  },
  {
    symbol: 'ETHFI',
    address: '0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB',
    chain: 'ethereum',
    usdPrice: 1.1707246089415464,
  },
  {
    symbol: 'sDOLA',
    address: '0xb45ad160634c528Cc3D2926d9807104FA3157305',
    chain: 'ethereum',
    usdPrice: 1.0999216877241782,
  },
  {
    symbol: 'ezETH',
    address: '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
    chain: 'ethereum',
    usdPrice: null,
  },
  {
    symbol: 'sFRAX',
    address: '0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32',
    chain: 'ethereum',
    usdPrice: 1.1096446285557429,
  },
  {
    symbol: 'USDe',
    address: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
    chain: 'ethereum',
    usdPrice: 1.0004283272617351,
  },
  {
    symbol: 'wstETH',
    address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    chain: 'ethereum',
    usdPrice: 3221.8239874724286,
  },
  {
    symbol: 'WETH',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    chain: 'ethereum',
    usdPrice: 2703.2706511628267,
  },
  {
    symbol: 'sUSDe',
    address: '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497',
    chain: 'ethereum',
    usdPrice: 1.1513030611161528,
  },
  {
    symbol: 'pufETH',
    address: '0xD9A442856C234a39a81a089C06451EBAa4306a72',
    chain: 'ethereum',
    usdPrice: 2803.417970729767,
  },
  {
    symbol: 'WBTC',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    chain: 'ethereum',
    usdPrice: 97887.09529556196,
  },
  {
    symbol: 'UwU',
    address: '0x55C08ca52497e2f1534B59E2917BF524D4765257',
    chain: 'ethereum',
    usdPrice: 0.012731552600553007,
  },
  {
    symbol: 'tBTC',
    address: '0x18084fbA666a33d37592fA2633fD49a74DD93a88',
    usdPrice: null,
    chain: 'ethereum',
  },
  {
    symbol: 'CRV',
    address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    usdPrice: null,
    chain: 'ethereum',
  },
  {
    symbol: 'SQUID',
    address: '0x6e58089d8E8f664823d26454f49A5A0f2fF697Fe',
    chain: 'fraxtal',
    usdPrice: null,
  },
  {
    symbol: 'crvUSD',
    address: '0xB102f7Efa0d5dE071A8D37B3548e1C7CB148Caf3',
    usdPrice: null,
    chain: 'fraxtal',
  },
  {
    symbol: 'CRV',
    address: '0x331B9182088e2A7d6D3Fe4742AbA1fB231aEcc56',
    chain: 'fraxtal',
    usdPrice: 0.5777548800000001,
  },
  {
    symbol: 'FXS',
    address: '0xFc00000000000000000000000000000000000002',
    chain: 'fraxtal',
    usdPrice: 1.7102394,
  },
  {
    symbol: 'sfrxUSD',
    address: '0xfc00000000000000000000000000000000000008',
    chain: 'fraxtal',
    usdPrice: 1.109793792183224,
  },
  {
    symbol: 'sfrxETH',
    address: '0xFC00000000000000000000000000000000000005',
    chain: 'fraxtal',
    usdPrice: 3015.8662585172283,
  },
  {
    symbol: 'stXAI',
    address: '0xab5c23bdbE99d75A7Ae4756e7cCEfd0A97B37E78',
    chain: 'arbitrum',
    usdPrice: 0.21829294913774286,
  },
  {
    symbol: 'crvUSD',
    address: '0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5',
    usdPrice: null,
    chain: 'arbitrum',
  },
  {
    symbol: 'tBTC',
    address: '0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40',
    chain: 'arbitrum',
    usdPrice: 97751.80258242389,
  },
  {
    symbol: 'IBTC',
    address: '0x050C24dBf1eEc17babE5fc585F06116A259CC77A',
    chain: 'arbitrum',
    usdPrice: 97557.79310687653,
  },
  {
    symbol: 'asdCRV',
    address: '0x75289388d50364c3013583d97bd70cED0e183e32',
    chain: 'arbitrum',
    usdPrice: 0.6427279359401797,
  },
  {
    symbol: 'ARB',
    address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    chain: 'arbitrum',
    usdPrice: 0.4857460060008621,
  },
  {
    symbol: 'WBTC',
    address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    chain: 'arbitrum',
    usdPrice: 98208.09605114785,
  },
  {
    symbol: 'WETH',
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    chain: 'arbitrum',
    usdPrice: 2711.6599781943705,
  },
  {
    symbol: 'gmUSDC',
    address: '0x5f851F67D24419982EcD7b7765deFD64fBb50a97',
    chain: 'arbitrum',
    usdPrice: null,
  },
  {
    symbol: 'FXN',
    address: '0x179F38f78346F5942E95C5C59CB1da7F55Cf7CAd',
    chain: 'arbitrum',
    usdPrice: 45.47635754031463,
  },
  {
    symbol: 'CRV',
    address: '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978',
    chain: 'arbitrum',
    usdPrice: 0.5794560975151747,
  },
  {
    symbol: 'CRV',
    address: '0x0994206dfE8De6Ec6920FF4D779B0d950605Fb53',
    chain: 'optimism',
    usdPrice: null,
  },
  {
    symbol: 'crvUSD',
    address: '0xC52D7F23a2e460248Db6eE192Cb23dD12bDDCbf6',
    usdPrice: null,
    chain: 'optimism',
  },
  {
    symbol: 'OP',
    address: '0x4200000000000000000000000000000000000042',
    chain: 'optimism',
    usdPrice: 1.4905563964960864,
  },
  {
    symbol: 'wstETH',
    address: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
    chain: 'optimism',
    usdPrice: null,
  },
  {
    symbol: 'WETH',
    address: '0x4200000000000000000000000000000000000006',
    chain: 'optimism',
    usdPrice: 3262.5373942715196,
  },
  {
    symbol: 'sfrxETH',
    address: '0xac3E018457B222d93114458476f3E3416Abbe38F',
    usdPrice: 3005.634169914068,
    chain: 'ethereum',
  },
]

export const oneToken = (chain?: string) =>
  chain ? oneOf(...TOKENS.filter((t) => t.chain === chain)!) : oneOf(...TOKENS)

export const mockTokenPrices = () =>
  cy.intercept('https://prices.curve.fi/v1/usd_price/*/*', (req) => {
    const address = new URL(req.url).pathname.split('/').pop()
    const token = TOKENS.find((t) => t.address === address)
    if (!token) {
      return req.reply(404, { error: `Token ${address} not in the mocked data` })
    }
    const data = {
      address: token.address,
      usd_price: token.usdPrice,
      last_updated: '2025-02-11T16:18:47',
    }
    req.reply({ data })
  })
