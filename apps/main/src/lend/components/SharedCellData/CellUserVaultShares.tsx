import ChipVaultSharesUsdRate from '@/lend/components/InpChipVaultShareUsdRate'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'

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

  const { error, vaultShares = '0', gauge = '0' } = marketsBalancesResp ?? {}

  const totalVaultShares = +vaultShares + +gauge

  return (
    <>
      {typeof marketsBalancesResp === 'undefined' ? null : error ? (
        '?'
      ) : totalVaultShares === 0 ? null : (
        <ChipVaultSharesUsdRate noPadding rChainId={rChainId} rOwmId={rOwmId} amount={totalVaultShares} />
      )}
    </>
  )
}

export default CellUserVaultShares
