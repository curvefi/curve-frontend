import lodash from 'lodash'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import { useChainId } from 'wagmi'
import useStore from '@/loan/store/useStore'
import { ChainId } from '@/loan/types/loan.types'
import { getTokenName } from '@/loan/utils/utilsLoan'
import Box from '@ui/Box'
import TextCaption from '@ui/TextCaption'
import { Chip } from '@ui/Typography'
import { formatNumber, type NumberFormatOptions } from '@ui/utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

const { isUndefined } = lodash

type Props = {
  rChainId: ChainId
  collateralId: string
}

const TableCellTotalCollateral = ({ rChainId, collateralId }: Props) => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[collateralId])
  const llamma = useStore((state) => state.collaterals.collateralDatasMapper[rChainId]?.[collateralId]?.llamma)

  const chainId = useChainId()
  const { data: collateralUsdRate } = useTokenUsdRate({ chainId, tokenAddress: llamma?.collateral ?? '' })

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const { totalCollateral, totalStablecoin } = loanDetails ?? {}

  const totalCollateralUsd = Number(totalCollateral) * Number(collateralUsdRate)
  const totalCollateralValue = (totalCollateralUsd + Number(totalStablecoin)).toString()

  const breakdowns = useMemo<{ label: string; value: string | number; isUsd: boolean }[]>(() => {
    if (!llamma || !totalCollateralUsd || !totalStablecoin) return []

    const { collateral, stablecoin } = getTokenName(llamma)

    return [
      { label: collateral, value: totalCollateralUsd, isUsd: true },
      { label: stablecoin, value: totalStablecoin, isUsd: false },
    ]
  }, [llamma, totalCollateralUsd, totalStablecoin])

  if (isUndefined(totalCollateral) || isUndefined(totalStablecoin) || isUndefined(collateralUsdRate)) {
    return <></>
  }

  if (collateralUsdRate == null || +collateralUsdRate === 0) {
    return (
      <Chip tooltip={t`Unable to get USD rate`} tooltipProps={{ placement: 'bottom-end' }}>
        ?
      </Chip>
    )
  }

  return (
    <Box grid>
      {formatNumber(totalCollateralValue, { notation: 'compact', currency: 'USD' })}
      {isAdvancedMode && (
        <>
          {+totalCollateralValue > 0 && (
            <TotalSummary>
              {breakdowns.map(({ label, value, isUsd }, idx) => {
                const isLast = breakdowns.length - 1 === idx
                const formatOptions: NumberFormatOptions = isUsd
                  ? { currency: 'USD', style: 'currency', notation: 'compact' }
                  : { notation: 'compact' }

                return `${idx === 0 ? '' : ''}${formatNumber(value, formatOptions)} ${label}${isLast ? '' : ' + '}`
              })}
            </TotalSummary>
          )}
        </>
      )}
    </Box>
  )
}

const TotalSummary = styled(TextCaption)`
  margin-top: 0.2rem;
  white-space: nowrap;
`

export default TableCellTotalCollateral
