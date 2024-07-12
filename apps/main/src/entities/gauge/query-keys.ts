export const gaugeKeys = {
  all: () => ['gauge'] as const,
  estimateGas: () => ['estimateGas'] as const,
  params: (chain?: ChainId, id?: string) => [chain, id] as const,
  gauge: (chain?: ChainId, id?: string) => [...gaugeKeys.all(), ...gaugeKeys.params(chain, id)] as const,
  version: (chain?: ChainId, id?: string) => [...gaugeKeys.all(), 'version', ...gaugeKeys.params(chain, id)] as const,
  status: (chain?: ChainId, id?: string) => [...gaugeKeys.all(), 'status', ...gaugeKeys.params(chain, id)] as const,
  manager: (chain?: ChainId, id?: string) => [...gaugeKeys.all(), 'manager', ...gaugeKeys.params(chain, id)] as const,
  distributors: (chain?: ChainId, id?: string) =>
    [...gaugeKeys.all(), 'distributors', ...gaugeKeys.params(chain, id)] as const,
  isDepositRewardAvailable: (chain?: ChainId, id?: string) =>
    [...gaugeKeys.all(), 'isDepositRewardAvailable', ...gaugeKeys.params(chain, id)] as const,
  depositRewardIsApproved: (chain: ChainId, id: string, token: string, amount: number | string) =>
    [...gaugeKeys.all(), 'depositRewardIsApproved', ...gaugeKeys.params(chain, id), token, amount] as const,
  estimateGasDepositRewardApprove: (chain?: ChainId, id?: string, token?: string, amount?: number | string) =>
    [
      ...gaugeKeys.all(),
      ...gaugeKeys.estimateGas(),
      'depositRewardApprove',
      ...gaugeKeys.params(chain, id),
      token,
      amount,
    ] as const,
  estimateGasAddRewardToken: (chain?: ChainId, poolId?: string, token?: string, distributor?: string) =>
    [
      ...gaugeKeys.all(),
      ...gaugeKeys.estimateGas(),
      'addRewardToken',
      ...gaugeKeys.params(chain, poolId),
      token,
      distributor,
    ] as const,
  addRewardToken: (chain?: ChainId, poolId?: string, token?: string, distributor?: string) =>
    [...gaugeKeys.all(), 'addRewardToken', ...gaugeKeys.params(chain, poolId), token, distributor] as const,
} as const
