import { useSharesToAssetsAmount } from '@/llamalend/queries/supply/supply-user-vault-amounts.query'
import { useUserBalances } from '@/llamalend/queries/user/user-balances.query'
import { combineQueryState } from '@ui-kit/lib'
import { UserMarketQuery } from '@ui-kit/lib/model'
import { FieldsOf } from '@ui-kit/lib/validation/types'
import { decimalSum } from '@ui-kit/utils/decimal'

export const useVaultUserBalances = (query: FieldsOf<UserMarketQuery>, enabled?: boolean) => {
  const userBalances = useUserBalances(query, enabled)
  const stakedSharesAmount = useSharesToAssetsAmount({ ...query, shares: userBalances?.data?.gauge }, enabled)

  // deposited + staked shares
  const totalShares =
    userBalances.data?.vaultShares &&
    userBalances.data.gauge &&
    decimalSum(userBalances.data.vaultShares, userBalances.data.gauge)

  // deposited + staked shares amount
  const totalSharesAmount =
    userBalances.data?.vaultSharesConverted &&
    stakedSharesAmount.data &&
    decimalSum(stakedSharesAmount.data, userBalances.data.vaultSharesConverted)

  return {
    data: {
      depositedShares: userBalances.data?.vaultShares,
      stakedShares: userBalances.data?.gauge,
      totalShares,
      depositedSharesAmount: userBalances.data?.vaultSharesConverted,
      stakedSharesAmount: stakedSharesAmount.data,
      totalSharesAmount,
    },
    ...combineQueryState(userBalances, stakedSharesAmount),
  }
}
