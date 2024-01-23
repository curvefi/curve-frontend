import type { FormLpTokenExpected } from '@/components/PagePool/Deposit/types'

import React, { useMemo } from 'react'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils'

import DetailInfo from '@/ui/DetailInfo'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'

const DetailInfoEstLpTokens = ({
  formLpTokenExpected,
  maxSlippage,
  poolDataCacheOrApi,
}: {
  formLpTokenExpected: FormLpTokenExpected
  maxSlippage: string
  poolDataCacheOrApi: PoolDataCacheOrApi
}) => {
  const { referenceAsset } = poolDataCacheOrApi.pool
  const showTooltip = referenceAsset !== 'CRYPTO'
  const parsedVirtualPrice = `${formatNumber(formLpTokenExpected.virtualPrice)} ${referenceAsset}`

  // min lp tokens received including slippage
  const lpTokensExpectedWithSlippage = useMemo(() => {
    const expectedNum = Number(formLpTokenExpected.expected)
    const maxSlippageNum = Number(maxSlippage)

    if (expectedNum && maxSlippageNum) {
      return (expectedNum * (100 - maxSlippageNum)) / 100
    }
  }, [formLpTokenExpected.expected, maxSlippage])

  return (
    <DetailInfo
      isBold
      loading={formLpTokenExpected.loading}
      loadingSkeleton={[85, 23]}
      className={formLpTokenExpected.expected.length > 20 ? 'isRow' : ''}
      label={t`Minimum LP Tokens:`}
      tooltip={
        showTooltip ? (
          <IconTooltip placement="top end" noWrap>
            {formatNumber(1)} Curve {poolDataCacheOrApi.pool.id} LP token = {parsedVirtualPrice}
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
