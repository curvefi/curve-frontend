import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import Chip from '@ui/Typography/Chip'
import type { ChipProps } from '@ui/Typography/types'
import { formatNumber } from '@ui/utils'

const CellVaultPricePerShare = ({
  rChainId,
  rOwmId,
  type,
  ...props
}: ChipProps & {
  rChainId: ChainId
  rOwmId: string
  type: 'borrow' | 'supply'
}) => {
  const resp = useStore((state) => state.markets.vaultPricePerShare[rChainId]?.[rOwmId])

  const { pricePerShare, error } = resp ?? {}

  return (
    <>
      {typeof resp === 'undefined' ? null : error ? (
        '?'
      ) : (
        <Chip {...props}>{formatNumber(pricePerShare, { showAllFractionDigits: true })}</Chip>
      )}
    </>
  )
}

export default CellVaultPricePerShare
