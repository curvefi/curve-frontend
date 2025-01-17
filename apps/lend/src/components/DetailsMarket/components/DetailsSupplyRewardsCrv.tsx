import React, { useMemo } from 'react'
import { t } from '@lingui/macro'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Chip from '@/ui/Typography/Chip'
import Icon from '@/ui/Icon'
import { ChainId } from '@/types/lend.types'

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
