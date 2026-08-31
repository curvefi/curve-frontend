import { createPublicClient, encodeFunctionData, erc20Abi, http, parseAbi, type Address } from 'viem'
import { sendAdminTransaction } from '@cy/support/helpers/tenderly/vnet-tx'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import { waitFor } from '@primitives/promise.utils'

const GAUGE_ABI = parseAbi([
  'function add_reward(address _reward_token, address _distributor)',
  'function manager() view returns (address)',
  'function set_gauge_manager(address _manager)',
  'function reward_data(address _reward_token) view returns (address token, address distributor, uint256 period_finish, uint256 rate, uint256 last_update, uint256 integral)',
])

const getGaugeManager = ({ publicRpcUrl, gaugeAddress }: { publicRpcUrl: string; gaugeAddress: Address }) =>
  cy.then(LOAD_TIMEOUT, async () => {
    const client = createPublicClient({ transport: http(publicRpcUrl) })
    return await client.readContract({
      address: gaugeAddress,
      abi: GAUGE_ABI,
      functionName: 'manager',
    })
  })

export const setGaugeManager = ({
  adminRpcUrl,
  publicRpcUrl,
  gaugeAddress,
  currentManagerAddress,
  nextManagerAddress,
}: {
  adminRpcUrl: string
  publicRpcUrl: string
  gaugeAddress: Address
  currentManagerAddress: Address
  nextManagerAddress: Address
}) => {
  const client = createPublicClient({ transport: http(publicRpcUrl) })

  return getGaugeManager({ publicRpcUrl, gaugeAddress }).then(managerAddress => {
    if (managerAddress === nextManagerAddress) return

    expect(managerAddress).to.equal(currentManagerAddress)

    return sendAdminTransaction({
      adminRpcUrl,
      client,
      from: currentManagerAddress,
      to: gaugeAddress,
      data: encodeFunctionData({ abi: GAUGE_ABI, functionName: 'set_gauge_manager', args: [nextManagerAddress] }),
    })
  })
}

export const addGaugeReward = ({
  adminRpcUrl,
  publicRpcUrl,
  gaugeAddress,
  managerAddress,
  rewardTokenAddress,
  distributorAddress,
}: {
  adminRpcUrl: string
  publicRpcUrl: string
  gaugeAddress: Address
  managerAddress: Address
  rewardTokenAddress: Address
  distributorAddress: Address
}) => {
  const client = createPublicClient({ transport: http(publicRpcUrl) })

  return sendAdminTransaction({
    adminRpcUrl,
    client,
    from: managerAddress,
    to: gaugeAddress,
    data: encodeFunctionData({
      abi: GAUGE_ABI,
      functionName: 'add_reward',
      args: [rewardTokenAddress, distributorAddress],
    }),
  })
}

export const getErc20Balance = ({
  publicRpcUrl,
  tokenAddress,
  accountAddress,
}: {
  publicRpcUrl: string
  tokenAddress: Address
  accountAddress: Address
}) =>
  cy.then(LOAD_TIMEOUT, async () => {
    const client = createPublicClient({ transport: http(publicRpcUrl) })
    return await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [accountAddress],
    })
  })

export const expectErc20BalanceChange = ({
  publicRpcUrl,
  tokenAddress,
  accountAddress,
  initialBalance,
  expectedChange,
}: {
  publicRpcUrl: string
  tokenAddress: Address
  accountAddress: Address
  initialBalance: bigint
  expectedChange: bigint
}) =>
  cy.then(TRANSACTION_LOAD_TIMEOUT, async () => {
    const client = createPublicClient({ transport: http(publicRpcUrl) })
    const readBalance = async () =>
      await client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [accountAddress],
      })

    await waitFor(async () => (await readBalance()) - initialBalance === expectedChange, {
      ...TRANSACTION_LOAD_TIMEOUT,
      message: `Expected ERC20 balance change to be ${expectedChange}`,
    })
    expect(await readBalance()).to.equal(initialBalance + expectedChange)
  })

export const expectGaugeRewardDistributor = ({
  publicRpcUrl,
  gaugeAddress,
  rewardTokenAddress,
  expectedDistributorAddress,
}: {
  publicRpcUrl: string
  gaugeAddress: Address
  rewardTokenAddress: Address
  expectedDistributorAddress: Address
}) =>
  cy.then(LOAD_TIMEOUT, async () => {
    const client = createPublicClient({ transport: http(publicRpcUrl) })
    const [, distributor] = await client.readContract({
      address: gaugeAddress,
      abi: GAUGE_ABI,
      functionName: 'reward_data',
      args: [rewardTokenAddress],
    })

    expect(distributor).to.equal(expectedDistributorAddress)
  })
