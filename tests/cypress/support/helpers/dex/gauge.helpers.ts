import { createPublicClient, encodeFunctionData, http, parseAbi, type Address } from 'viem'
import { sendAdminTransaction } from '@cy/support/helpers/tenderly/vnet-tx'
import { LOAD_TIMEOUT } from '@cy/support/ui'

const GAUGE_ABI = parseAbi([
  'function set_gauge_manager(address _manager)',
  'function reward_data(address _reward_token) view returns (address token, address distributor, uint256 period_finish, uint256 rate, uint256 last_update, uint256 integral)',
])

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

  return sendAdminTransaction({
    adminRpcUrl,
    client,
    from: currentManagerAddress,
    to: gaugeAddress,
    data: encodeFunctionData({ abi: GAUGE_ABI, functionName: 'set_gauge_manager', args: [nextManagerAddress] }),
  })
}

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
