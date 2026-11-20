import { getAddress } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import type { Address, Token } from '@primitives/address.utils'
import type { PartialRecord } from '@primitives/objects.utils'

// TODO: remove this file once the prices API returns the coins of LP tokens
const LP_TOKEN_COINS: PartialRecord<Chain, Record<Address, Token[]>> = {
  ethereum: {
    // reUSD/sfrxUSD
    '0xed785Af60bEd688baa8990cD5c4166221599A441': [
      { symbol: 'reUSD', address: '0x57aB1E0003F623289CD798B1824Be09a793e4Bec' },
      { symbol: 'sfrxUSD', address: '0xcf62F905562626CfcDD2261162a51fd02Fc9c5b6' },
    ],
  },
}

export const findLpCoins = (blockchainId: Chain, address: Address) =>
  LP_TOKEN_COINS[blockchainId]?.[getAddress(address)]
