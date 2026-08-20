 
import {
  concat,
  createPublicClient,
  encodeAbiParameters,
  encodeFunctionData,
  http,
  parseEther,
  type Address,
  type PublicClient,
  zeroHash,
} from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  layerZeroCrvCapacityAbi,
  layerZeroRetryAbi,
  layerZeroStableCapacityAbi,
} from '@/bridge/features/bridge/layerzero'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { advanceVirtualNetworkClock } from '@cy/support/helpers/tenderly/vnet-time'
import { sendAdminTransaction } from '@cy/support/helpers/tenderly/vnet-tx'
import { Chain } from '@ui-kit/utils'

const USER = privateKeyToAccount(generatePrivateKey()).address
const CRV_BRIDGE = '0xC91113B4Dd89dd20FDEECDAC82477Bc99A840355'
const STABLE_BRIDGE = '0x0A92Fd5271dB1C41564BD01ef6b1a75fC1db4d4f'
const CRV = '0x9996D0276612d23b35f90C51EE935520B3d7355B'
const CRVUSD = '0xe2fb3F127f5450DeE44afe054385d74C392BdeF4'
type SetupResult = { adminRpcUrl: string; client: PublicClient; timestamp: bigint }

const managementAbi = [
  { type: 'function', name: 'owner', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'LZ_ENDPOINT', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  {
    type: 'function',
    name: 'set_limit',
    stateMutability: 'nonpayable',
    inputs: [{ type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'lzReceive',
    stateMutability: 'nonpayable',
    inputs: [{ type: 'uint16' }, { type: 'bytes' }, { type: 'uint64' }, { type: 'bytes' }],
    outputs: [],
  },
] as const
const erc20BalanceAbi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

describe('LayerZero delayed retry', () => {
  const getVnet = createVirtualTestnet(uuid => ({
    slug: `layerzero-retry-${uuid}`,
    display_name: `LayerZero retry (${uuid})`,
    chain_id: Chain.Bsc,
    fork_config: { block_number: 'latest' },
  }))

  const setup = (bridge: Address, amount: bigint, limit: bigint, nonce: bigint) => {
    const vnet = getVnet()
    const { adminRpcUrl, publicRpcUrl } = getRpcUrls(vnet)
    const client = createPublicClient({ transport: http(publicRpcUrl) })
    return cy
      .wrap(
        Promise.all([
          client.readContract({ address: bridge, abi: managementAbi, functionName: 'owner' }),
          client.readContract({ address: bridge, abi: managementAbi, functionName: 'LZ_ENDPOINT' }),
        ]),
      )
      .then(result => {
        const [owner, endpoint] = result as [Address, Address]
        fundEth({
          adminRpcUrl,
          amountWei: `0x${parseEther('1').toString(16)}`,
          recipientAddresses: [owner, endpoint, USER],
        })
        sendAdminTransaction({
          adminRpcUrl,
          client,
          from: owner,
          to: bridge,
          data: encodeFunctionData({ abi: managementAbi, functionName: 'set_limit', args: [limit] }),
        })
        return sendAdminTransaction({
          adminRpcUrl,
          client,
          from: endpoint,
          to: bridge,
          data: encodeFunctionData({
            abi: managementAbi,
            functionName: 'lzReceive',
            args: [
              101,
              concat([bridge, bridge]),
              nonce,
              encodeAbiParameters([{ type: 'address' }, { type: 'uint256' }], [USER, amount]),
            ],
          }),
        }).then(() => client.getBlock().then(block => ({ adminRpcUrl, client, timestamp: block.timestamp })))
      })
  }

  it('leaves the CRV remainder pending after a partial retry', () => {
    const amount = parseEther('2')
    setup(CRV_BRIDGE, amount, parseEther('1'), 91n).then(result => {
      const { adminRpcUrl, client, timestamp } = result as SetupResult
      cy.wrap(client.readContract({ address: CRV_BRIDGE, abi: layerZeroCrvCapacityAbi, functionName: 'period' })).then(
        period => {
          advanceVirtualNetworkClock({ vnet: getVnet(), seconds: Number(period) + 1 })
          sendAdminTransaction({
            adminRpcUrl,
            client,
            from: USER,
            to: CRV_BRIDGE,
            data: encodeFunctionData({
              abi: layerZeroRetryAbi,
              functionName: 'retry',
              args: [91n, timestamp, USER, amount],
            }),
          }).then(() => {
            cy.wrap(
              client.readContract({
                address: CRV_BRIDGE,
                abi: layerZeroRetryAbi,
                functionName: 'delayed',
                args: [91n],
              }),
            ).should('not.equal', zeroHash)
            cy.wrap(
              client.readContract({ address: CRV, abi: erc20BalanceAbi, functionName: 'balanceOf', args: [USER] }),
            ).should('equal', parseEther('1'))
          })
        },
      )
    })
  })

  it('retries the full delayed stablecoin transfer', () => {
    const amount = parseEther('2')
    setup(STABLE_BRIDGE, amount, 0n, 92n).then(result => {
      const { adminRpcUrl, client, timestamp } = result as SetupResult
      cy.wrap(
        client.readContract({ address: STABLE_BRIDGE, abi: layerZeroStableCapacityAbi, functionName: 'delay' }),
      ).then(delay => {
        advanceVirtualNetworkClock({ vnet: getVnet(), seconds: Number(delay) + 1 })
        sendAdminTransaction({
          adminRpcUrl,
          client,
          from: USER,
          to: STABLE_BRIDGE,
          data: encodeFunctionData({
            abi: layerZeroRetryAbi,
            functionName: 'retry',
            args: [92n, timestamp, USER, amount],
          }),
        }).then(() => {
          cy.wrap(
            client.readContract({
              address: STABLE_BRIDGE,
              abi: layerZeroRetryAbi,
              functionName: 'delayed',
              args: [92n],
            }),
          ).should('equal', zeroHash)
          cy.wrap(
            client.readContract({ address: CRVUSD, abi: erc20BalanceAbi, functionName: 'balanceOf', args: [USER] }),
          ).should('equal', amount)
        })
      })
    })
  })
})
