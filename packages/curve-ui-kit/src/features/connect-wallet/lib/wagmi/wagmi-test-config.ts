import { http } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import type { Hex } from '@primitives/address.utils'
import { ethereum } from './custom-chains'
import { createWagmiConfig } from './wagmi-config'
import { createTestConnector } from './wagmi-test'

type CreateTestWagmiConfigOptions = {
  privateKey?: Hex
}

export const createTestWagmiConfig = ({ privateKey = generatePrivateKey() }: CreateTestWagmiConfigOptions = {}) =>
  createWagmiConfig({
    chains: [ethereum],
    connectors: [createTestConnector({ privateKey, chain: ethereum })],
    transports: { [ethereum.id]: http() },
  })
