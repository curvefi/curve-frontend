import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { Decimal } from '@ui-kit/utils'
import { SlippageToleranceActionInfo } from '@ui-kit/widgets/SlippageSettings'
import { useCreateLoanExpectedCollateral } from '../queries/create-loan-expected-collateral.query'
import { useCreateLoanMaxReceive } from '../queries/create-loan-max-receive.query'
import { useCreateLoanPriceImpact } from '../queries/create-loan-price-impact.query'
import type { BorrowFormQueryParams, Token } from '../types'

/**
 * Action infos displayed when leverage is enabled in the borrow form accordion.
 */
export const BorrowLeverageActionInfos = <ChainId extends IChainId>({
  params,
  collateralToken,
  isOpen,
  slippage,
  onSlippageChange,
}: {
  params: BorrowFormQueryParams<ChainId>
  isOpen: boolean
  collateralToken: Token | undefined
  slippage: Decimal
  onSlippageChange: (newSlippage: Decimal) => void
}) => {
  const {
    data: expectedCollateral,
    isLoading: expectedCollateralLoading,
    error: expectedCollateralError,
  } = useCreateLoanExpectedCollateral(params, isOpen)

  const {
    data: maxBorrowReceive,
    isLoading: maxBorrowReceiveLoading,
    error: maxBorrowReceiveError,
  } = useCreateLoanMaxReceive(params, isOpen)

  const { totalCollateral, leverage } = expectedCollateral ?? {}
  const { avgPrice, maxLeverage } = maxBorrowReceive ?? {}

  const {
    data: priceImpactPercent,
    isLoading: priceImpactPercentLoading,
    error: priceImpactPercentError,
  } = useCreateLoanPriceImpact(params, isOpen)
  const isHighImpact = priceImpactPercent != null && priceImpactPercent > +slippage

  return (
    <>
      <ActionInfo
        label={t`Leverage`}
        value={formatNumber(leverage, { defaultValue: '1', maximumFractionDigits: 0 })}
        valueRight={
          leverage != null && maxLeverage && ` (max ${formatNumber(maxLeverage, { maximumFractionDigits: 0 })})`
        }
        error={expectedCollateralError || maxBorrowReceiveError}
        loading={expectedCollateralLoading || maxBorrowReceiveLoading}
      />
      <ActionInfo
        label={t`Expected`}
        value={formatNumber(totalCollateral, { currency: collateralToken?.symbol, defaultValue: '-' })}
        error={expectedCollateralError}
        loading={expectedCollateralLoading}
      />
      <ActionInfo
        label={t`Expected avg. price`}
        value={formatNumber(avgPrice, { defaultValue: '-' })}
        error={maxBorrowReceiveError}
        loading={maxBorrowReceiveLoading}
      />
      <ActionInfo
        label={isHighImpact ? t`High price impact` : t`Price impact`}
        value={formatNumber(priceImpactPercent, { defaultValue: '-' })}
        valueRight={priceImpactPercent != null && '%'}
        {...(isHighImpact && { valueColor: 'error' })}
        error={priceImpactPercentError}
        loading={priceImpactPercentLoading}
        testId="borrow-price-impact"
      />
      <SlippageToleranceActionInfo maxSlippage={slippage} onSave={onSlippageChange} />
    </>
  )
}
