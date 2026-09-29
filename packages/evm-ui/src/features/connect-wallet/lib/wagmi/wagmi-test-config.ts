import { http } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import type { Hex } from '@primitives/address.utils'
import { createWagmiConfig } from './wagmi-config'
import { createTestConnector } from './wagmi-test'

type CreateTestWagmiConfigOptions = { account?: Hex }

export const createTestWagmiConfig = ({ account = generatePrivateKey() }: CreateTestWagmiConfigOptions = {}) =>
  createWagmiConfig({
    chains: [mainnet],
    connectors: [createTestConnector({ account, chain: mainnet })],
    transports: { [mainnet.id]: http() },
  })
