import { useMemo } from 'react'
import type { FormLpTokenExpected } from '@/dex/components/PagePool/Deposit/types'
import { PoolDataCacheOrApi } from '@/dex/types/main.types'
import { DetailInfo } from '@ui/DetailInfo'
import { TooltipIcon as IconTooltip } from '@ui/Tooltip/TooltipIcon'
import { t } from '@ui-kit/lib/i18n'
import { formatNumber, amount } from '@ui-kit/utils'

export const DetailInfoEstLpTokens = ({
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
  const parsedVirtualPrice = `${formatNumber(amount(formLpTokenExpected.virtualPrice), { abbreviate: false }) ?? '-'} ${referenceAsset}`

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
      label={t`Minimum LP Tokens:`}
      tooltip={
        showTooltip ? (
          <IconTooltip placement="top-end" noWrap>
            {formatNumber(1, { abbreviate: false })} LP token = {parsedVirtualPrice}
          </IconTooltip>
        ) : (
          ''
        )
      }
    >
      {formatNumber(amount(lpTokensExpectedWithSlippage), { abbreviate: false }) ?? '-'}
    </DetailInfo>
  )
}
