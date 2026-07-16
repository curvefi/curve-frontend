import { useUserBalances } from '@/llamalend/queries/user/user-balances.query'
import { maybes } from '@primitives/objects.utils'
import { UserMarketQuery } from '@ui-kit/lib/model'
import { FieldsOf } from '@ui-kit/lib/validation/types'
import { mapQuery } from '@ui-kit/types/util'
import { decimalSum } from '@ui-kit/utils/decimal'

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
