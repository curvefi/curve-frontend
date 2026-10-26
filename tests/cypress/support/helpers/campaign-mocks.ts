const MOCK_ICON =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%2210%22 fill=%22%233b82f6%22/%3E%3C/svg%3E'

type MerklOpportunityParams = {
  identifier: string
  pool: { address: string; chain_id: number; name: string | null }
  apr: number
  symbol: string
  platform: string
  network: string
  tokenAddress?: string
}

export const createMerklOpportunity = ({
  identifier,
  pool,
  apr,
  symbol,
  platform,
  network,
  tokenAddress = `0x${(identifier.replace(/\D/g, '') || '5000').padStart(40, '0')}`,
}: MerklOpportunityParams) => ({
  type: 'POOL',
  identifier,
  name: `${platform} campaign`,
  description: `${platform} rewards for providing liquidity.`,
  howToSteps: [`Provide liquidity to ${pool.name}.`],
  action: 'POOL',
  apr,
  explorerAddress: pool.address,
  tags: [platform],
  chain: { id: pool.chain_id, name: network },
  rewardsRecord: {
    breakdowns: [{ token: { chainId: pool.chain_id, address: tokenAddress, symbol, icon: MOCK_ICON }, value: 100 }],
  },
})

export const mockPoolCampaigns = (
  pool: { address: string; name: string },
  tokenAddress: string,
  campaigns: { apr: number; symbol: string; network: string; chainId: number }[],
) =>
  cy
    .intercept(
      'GET',
      '/api/merkl/v1/opportunities*',
      campaigns.map(({ apr, symbol, network, chainId }) =>
        createMerklOpportunity({
          identifier: `${pool.address}-${symbol}`,
          pool: { ...pool, chain_id: chainId },
          network,
          apr,
          symbol,
          platform: symbol,
          tokenAddress,
        }),
      ),
    )
    .as('campaigns')
