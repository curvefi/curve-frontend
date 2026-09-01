import { custom, fallback, http, type RpcTransactionReceipt, zeroAddress } from 'viem'
import { mainnet } from 'viem/chains'
import { WAGMI_HTTP_OPTIONS } from '@evm-ui/features/connect-wallet/lib/wagmi/transports'
import { createWagmiConfig } from '@evm-ui/features/connect-wallet/lib/wagmi/wagmi-config'
import { createTestConnector } from '@evm-ui/features/connect-wallet/lib/wagmi/wagmi-test'
import { TEST_PRIVATE_KEY, TEST_TX_HASH } from './mock-loan-test-data'

const testTransactionReceipt: RpcTransactionReceipt = {
  blockHash: `0x${'0'.repeat(64)}` as const,
  blockNumber: '0x1',
  contractAddress: null,
  cumulativeGasUsed: '0x5208',
  effectiveGasPrice: '0x1',
  from: zeroAddress,
  gasUsed: '0x5208',
  logs: [],
  logsBloom: `0x${'0'.repeat(512)}` as const,
  status: '0x1',
  to: zeroAddress,
  transactionHash: TEST_TX_HASH,
  transactionIndex: '0x0',
  type: '0x2',
}

const mockedReceiptTransport = custom({
  request: ({ method, params }: { method: string; params?: unknown[] }): Promise<unknown> => {
    const [hash] = params ?? []
    if (method === 'eth_getTransactionReceipt' && hash === TEST_TX_HASH) return Promise.resolve(testTransactionReceipt)
    return Promise.reject(new Error(`Unsupported method: ${method}, http fallback is used`))
  },
})

export const mockedWagmiConfig = createWagmiConfig({
  chains: [mainnet],
  connectors: [createTestConnector({ privateKey: TEST_PRIVATE_KEY, chain: mainnet })],
  transports: { [mainnet.id]: fallback([mockedReceiptTransport, http(undefined, WAGMI_HTTP_OPTIONS)]) },
})
