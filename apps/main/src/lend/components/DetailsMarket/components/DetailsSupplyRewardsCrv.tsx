import { useMemo } from 'react'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import Icon from '@ui/Icon'
import Chip from '@ui/Typography/Chip'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

const DetailsSupplyRewardsCrv = ({
  rChainId,
  rOwmId,
  isBold,
}: {
  rChainId: ChainId
  rOwmId: string
  isBold?: boolean
}) => {
  const rewardsResp = useStore((state) => state.markets.rewardsMapper[rChainId]?.[rOwmId])

  const { rewards, error } = rewardsResp ?? {}

  const [base, boosted] = rewards?.crv ?? []

  const formattedCrvBase = useMemo(() => formatNumber(base, { ...FORMAT_OPTIONS.PERCENT, defaultValue: '-' }), [base])

  const formattedCrvBoosted = useMemo(() => {
    if (typeof boosted === 'undefined' || +boosted === 0) {
      return ''
    } else {
      return ` → ${formatNumber(boosted, FORMAT_OPTIONS.PERCENT)}`
    }
  }, [boosted])

  return (
    <Chip
      isBold={isBold}
      size="md"
      tooltip={t`CRV LP reward annualized (max tAPR can be reached with max boost of 2.50)`}
    >
      {error ? (
        '?'
      ) : (
        <>
          {formattedCrvBase}
          {formattedCrvBoosted}
          <Icon className="svg-tooltip" size={16} name="InformationSquare" />
        </>
      )}
    </Chip>
  )
}

export default DetailsSupplyRewardsCrv
