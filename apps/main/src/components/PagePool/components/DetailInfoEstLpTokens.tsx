import React, { useMemo } from 'react'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'

import DetailInfo from '@/ui/DetailInfo'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'

type Props = {
  expected: string | undefined
  virtualPrice: string | undefined
  isLoading: boolean
}

const DetailInfoEstLpTokens: React.FC<Props> = ({ expected = '', virtualPrice, isLoading }) => {
  const { pool, maxSlippage } = usePoolContext()

  const { referenceAsset } = pool ?? {}
  const showTooltip = referenceAsset !== 'CRYPTO'
  const parsedVirtualPrice = `${formatNumber(virtualPrice)} ${referenceAsset}`

  // min lp tokens received including slippage
  const lpTokensExpectedWithSlippage = useMemo(() => {
    const expectedNum = Number(expected)
    const maxSlippageNum = Number(maxSlippage)

    if (expectedNum && maxSlippageNum) {
      return (expectedNum * (100 - maxSlippageNum)) / 100
    }
  }, [expected, maxSlippage])

  return (
    <DetailInfo
      isBold
      loading={isLoading}
      loadingSkeleton={[85, 23]}
      className={expected.length > 20 ? 'isRow' : ''}
      label={t`Minimum LP Tokens:`}
      tooltip={
        showTooltip ? (
          <IconTooltip placement="top end" noWrap>
            {formatNumber(1)} LP token = {parsedVirtualPrice}
          </IconTooltip>
        ) : (
          ''
        )
      }
    >
      {formatNumber(lpTokensExpectedWithSlippage)}
    </DetailInfo>
  )
}

export default DetailInfoEstLpTokens
