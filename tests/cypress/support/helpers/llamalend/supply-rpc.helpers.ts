import type { Address } from 'viem'
import type { Decimal } from '@primitives/decimal.utils'
import { Chain } from '@ui-kit/utils'

export const SUPPLY_TEST_MARKETS = [
  {
    id: 'one-way-market-7',
    label: 'sUSDe-crvUSD Old Lend Market',
    chainId: Chain.Ethereum,
    borrowedTokenAddress: '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e' as Address,
    vaultAddress: '0x52096539ed1391CB50C6b9e4Fd18aFd2438ED23b' as Address,
    gaugeAddress: '0x82195f78c313540e0363736b8320a256a019f7dd' as Address,
    deposit: '12.5' as Decimal,
    partialWithdraw: '2.5' as Decimal,
    borrowedTokenDecimals: 18,
  },
  {
    id: 'one-way-market-41',
    label: 'sreUSD-crvUSD New Lend Market',
    chainId: Chain.Ethereum,
    borrowedTokenAddress: '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e' as Address,
    vaultAddress: '0xC32B0Cf36e06c790A568667A17DE80cba95A5Aad' as Address,
    gaugeAddress: '0x29e9975561fad3a7988ca96361ab5c5317cb32af' as Address,
    deposit: '12.5' as Decimal,
    partialWithdraw: '2.5' as Decimal,
    borrowedTokenDecimals: 18,
  },
] as const
