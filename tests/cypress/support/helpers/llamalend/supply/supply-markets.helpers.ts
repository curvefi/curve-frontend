import {
  type Address,
  createPublicClient,
  erc20Abi,
  http,
  isAddressEqual,
  parseAbi,
  parseUnits,
  type PublicClient,
  zeroAddress,
} from 'viem'
import { mainnet } from 'viem/chains'
import { DEPRECATED_LLAMAS, MARKETS_ALERTS } from '@/llamalend/markets.constants'
import { ALIASES_ETHEREUM } from '@curvefi/llamalend-api/lib/constants/aliases'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { oneOf } from '@cy/support/generators'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import type { CreateVirtualTestnetResponse } from '@cy/support/helpers/tenderly/vnet-create'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { CRVUSD_ADDRESS, GAUGE_CONTROLLER } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { Chain } from '@primitives/network.utils'
import { CRVUSD_DECIMALS } from './supply-setup.helpers'

export const SUPPLY_TEST_CHAIN_ID: LlamaChainId = Chain.Ethereum
export const SUPPLY_DEPOSIT: Decimal = '12.5'
export const SUPPLY_PARTIAL_WITHDRAW: Decimal = '2.5'

type FactoryVersion = 'v1' | 'v2'

export type SupplyTestMarket = {
  id: string
  version: FactoryVersion
  controllerAddress: Address
  borrowedTokenAddress: Address
  gaugeAddress: Address
}

const FACTORY_V1_ABI = parseAbi([
  'function market_count() view returns (uint256)',
  'function controllers(uint256 n) view returns (address)',
  'function borrowed_tokens(uint256 n) view returns (address)',
  'function gauges(uint256 n) view returns (address)',
])
const FACTORY_V2_ABI = parseAbi([
  'struct Market { address vault; address controller; address amm; address collateral_token; address borrowed_token; address price_oracle; address monetary_policy; }',
  'function market_count() view returns (uint256)',
  'function markets(uint256 n) view returns (Market)',
])
const GAUGE_FACTORY_ABI = parseAbi(['function get_gauge_from_lp_token(address lp_token) view returns (address)'])
const CONTROLLER_V2_ABI = parseAbi([
  'function available_balance() view returns (uint256)',
  'function admin_fees() view returns (uint256)',
])
const GAUGE_CONTROLLER_ABI = parseAbi([
  'function gauge_relative_weight(address addr, uint256 time) view returns (uint256)',
])
const WEEK = 7n * 24n * 60n * 60n

const getFactoryMarketsV1 = async (client: PublicClient): Promise<SupplyTestMarket[]> => {
  const address = ALIASES_ETHEREUM.one_way_factory as Address
  const count = await client.readContract({ address, abi: FACTORY_V1_ABI, functionName: 'market_count' })
  return Promise.all(
    Cypress._.range(Number(count)).map(async index => {
      const args = [BigInt(index)] as const
      const [controllerAddress, borrowedTokenAddress, gaugeAddress] = await Promise.all([
        client.readContract({ address, abi: FACTORY_V1_ABI, functionName: 'controllers', args }),
        client.readContract({ address, abi: FACTORY_V1_ABI, functionName: 'borrowed_tokens', args }),
        client.readContract({ address, abi: FACTORY_V1_ABI, functionName: 'gauges', args }),
      ])
      return { id: `one-way-market-${index}`, version: 'v1', controllerAddress, borrowedTokenAddress, gaugeAddress }
    }),
  )
}

const getFactoryMarketsV2 = async (client: PublicClient): Promise<SupplyTestMarket[]> => {
  const address = ALIASES_ETHEREUM.one_way_factory_v2 as Address
  const count = await client.readContract({ address, abi: FACTORY_V2_ABI, functionName: 'market_count' })
  return Promise.all(
    Cypress._.range(Number(count)).map(async index => {
      const { vault, controller, borrowed_token } = await client.readContract({
        address,
        abi: FACTORY_V2_ABI,
        functionName: 'markets',
        args: [BigInt(index)],
      })
      // the v2 factory doesn't store gauges, they come from the gauge factory
      const gaugeAddress = await client.readContract({
        address: ALIASES_ETHEREUM.gauge_factory_v2 as Address,
        abi: GAUGE_FACTORY_ABI,
        functionName: 'get_gauge_from_lp_token',
        args: [vault],
      })
      return {
        id: `one-way-market-v2-${index}`,
        version: 'v2',
        controllerAddress: controller,
        borrowedTokenAddress: borrowed_token,
        gaugeAddress,
      }
    }),
  )
}

// crvUSD only for simplicity, so funding and amounts are the same for every market
const isSupportedMarket = ({ controllerAddress, borrowedTokenAddress, gaugeAddress }: SupplyTestMarket) =>
  isAddressEqual(borrowedTokenAddress, CRVUSD_ADDRESS) &&
  !isAddressEqual(gaugeAddress, zeroAddress) &&
  !DEPRECATED_LLAMAS.Lend.ethereum?.[controllerAddress] &&
  !MARKETS_ALERTS.Lend[Chain.Ethereum]?.[controllerAddress]

/** The rewards accrue over 7 days, so CRV emissions this week or next are enough */
const hasCrvEmissions = async (client: PublicClient, gaugeAddress: Address, timestamp: bigint) => {
  const week = (timestamp / WEEK) * WEEK
  const weights = await Promise.all(
    [week, week + WEEK].map(time =>
      client.readContract({
        address: GAUGE_CONTROLLER,
        abi: GAUGE_CONTROLLER_ABI,
        functionName: 'gauge_relative_weight',
        args: [gaugeAddress, time],
      }),
    ),
  )
  return weights.some(weight => weight > 0n)
}

// admin fees are part of the v2 available balance but can't be withdrawn
const getFreeLiquidityV2 = async (client: PublicClient, controllerAddress: Address) => {
  const [available, adminFees] = await Promise.all([
    client.readContract({ address: controllerAddress, abi: CONTROLLER_V2_ABI, functionName: 'available_balance' }),
    client.readContract({ address: controllerAddress, abi: CONTROLLER_V2_ABI, functionName: 'admin_fees' }),
  ])
  return available - adminFees
}

const getFreeLiquidity = (client: PublicClient, { version, controllerAddress }: SupplyTestMarket) =>
  version === 'v1'
    ? client.readContract({
        address: CRVUSD_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [controllerAddress],
      })
    : getFreeLiquidityV2(client, controllerAddress)

/** The test withdraws its whole deposit, which needs that much unborrowed crvUSD in the market */
const hasWithdrawableLiquidity = async (client: PublicClient, market: SupplyTestMarket) =>
  (await getFreeLiquidity(client, market)) >= parseUnits(SUPPLY_DEPOSIT, CRVUSD_DECIMALS)

const getSupplyTestMarkets = async (client: PublicClient) => {
  const { timestamp } = await client.getBlock()
  const markets = (await Promise.all([getFactoryMarketsV1(client), getFactoryMarketsV2(client)]))
    .flat()
    .filter(isSupportedMarket)
  const isEligible = await Promise.all(
    markets.map(
      async market =>
        (await hasCrvEmissions(client, market.gaugeAddress, timestamp)) &&
        (await hasWithdrawableLiquidity(client, market)),
    ),
  )
  return markets.filter((_, index) => isEligible[index])
}

/**
 * Gauge weights follow the weekly veCRV votes, so the markets with CRV emissions change over time.
 * Picks a random lend market from the factories on the fork, and fails when none can run the supply tests.
 */
export const pickSupplyTestMarket = (vnet: CreateVirtualTestnetResponse) =>
  cy.then(TIMEOUTS['tenderly.contractRead'], async () => {
    const markets = await getSupplyTestMarkets(
      createPublicClient({
        chain: mainnet,
        transport: http(getRpcUrls(vnet).publicRpcUrl),
        batch: { multicall: true },
      }),
    )
    expect(markets, 'crvUSD lend markets with CRV emissions').to.have.length.greaterThan(0)
    return oneOf(...markets)
  })
