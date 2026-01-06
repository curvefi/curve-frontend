import { custom, PrivateKeyAccount, type RpcTransactionRequest } from 'viem'
import type { TenderlyConfig } from '@cy/support/helpers/tenderly/account'
import { createTestConnector, CreateTestConnectorOptions } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-test'
import { sendVnetTransaction } from './vnet-transaction'

/**
 * Creates a custom transport that intercepts JSON-RPC requests to handle account retrieval and
 * transaction sending via Tenderly Virtual Testnet Admin API.
 */
const tenderlyTransport = (account: PrivateKeyAccount, tenderly: TenderlyConfig) =>
  custom({
    request: async ({ method, params: [param] }): Promise<unknown> => {
      if (method === 'eth_accounts') {
        return [account.address]
      }
      if (method === 'eth_sendTransaction') {
        return await sendVnetTransaction({ tenderly, tx: param as RpcTransactionRequest }).catch((err) => {
          console.error(`Tenderly failed for ${method}(${JSON.stringify(param)}). Error: ${err}`)
          throw err
        })
      }
      throw new Error(`Unsupported method: ${method}, http fallback is used`)
    },
  })

/** Creates a wagmi test connector for Tenderly vnets in conjunction with component tests. */
export const createTenderlyConnector = ({
  tenderly,
  ...opts
}: Pick<CreateTestConnectorOptions, 'privateKey' | 'chain'> & {
  /** Tenderly configuration for the Virtual Testnet */
  tenderly: TenderlyConfig
}) => createTestConnector({ ...opts, transport: (account) => tenderlyTransport(account, tenderly) })
