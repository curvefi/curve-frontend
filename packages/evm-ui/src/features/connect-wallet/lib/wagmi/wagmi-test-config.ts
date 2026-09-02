import { http } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import type { Hex } from '@primitives/address.utils'
import { createWagmiConfig } from './wagmi-config'
import { createTestConnector } from './wagmi-test'

type CreateTestWagmiConfigOptions = {
  privateKey?: Hex
}

export const createTestWagmiConfig = ({ privateKey = generatePrivateKey() }: CreateTestWagmiConfigOptions = {}) =>
  createWagmiConfig({
    chains: [mainnet],
    connectors: [createTestConnector({ privateKey, chain: mainnet })],
    transports: { [mainnet.id]: http() },
  })
