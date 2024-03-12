import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import ChipVaultSharesUsdRate from '@/components/InpChipVaultShareUsdRate'

const CellUserVaultShares = ({
  rChainId,
  rOwmId,
  userActiveKey,
}: {
  rChainId: ChainId
  rOwmId: string
  userActiveKey: string
}) => {
  const marketsBalancesResp = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])

  const { error, ...balances } = marketsBalancesResp ?? {}

  return (
    <>
      {typeof marketsBalancesResp === 'undefined' ? null : error ? (
        '?'
      ) : +balances.vaultShares === 0 ? null : (
        <>
          {formatNumber(balances.vaultShares, { defaultValue: '-' })}
          <br />
          <ChipVaultSharesUsdRate rChainId={rChainId} rOwmId={rOwmId} amount={balances.vaultShares} />
        </>
      )}
    </>
  )
}

export default CellUserVaultShares
