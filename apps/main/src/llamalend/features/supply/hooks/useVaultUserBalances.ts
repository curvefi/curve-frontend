import { useUserBalances } from '@/llamalend/queries/user/user-balances.query'
import { UserMarketQuery } from '@evm-ui/lib/model'
import { FieldsOf } from '@evm-ui/lib/validation/types'
import { mapQuery } from '@evm-ui/types/util'
import { decimalSum } from '@evm-ui/utils/decimal'
import { maybes } from '@primitives/objects.utils'

export const useVaultUserBalances = (query: FieldsOf<UserMarketQuery>, enabled?: boolean) =>
  mapQuery(useUserBalances(query, enabled), ({ gauge, gaugeConverted, vaultShares, vaultSharesConverted }) => ({
    depositedShares: vaultShares,
    stakedShares: gauge,
    // deposited + staked shares
    totalShares: maybes([vaultShares, gauge], decimalSum),
    depositedSharesAmount: vaultSharesConverted,
    stakedSharesAmount: gaugeConverted,
    // deposited + staked shares amount
    totalSharesAmount: maybes([vaultSharesConverted, gaugeConverted], decimalSum),
  }))
