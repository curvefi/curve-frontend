import { useMarketParameters } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { maybes } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { formatNumber } from '@ui-kit/utils'

/** Max LTV at N=4. loanDiscount comes from the API as a percent value, e.g. "11" for 11%. */
const getMaxLTV = (a: number | undefined, loanDiscount: string | undefined) =>
  maybes([a, loanDiscount], ([a, loanDiscount]) =>
    a === 0 ? undefined : ((a - 1) / a) ** 2 * (1 - Number(loanDiscount) / 100) * 100,
  )

export const MarketLoanParameters = ({ chainId, marketId }: { chainId: IChainId; marketId: string | undefined }) => {
  const {
    data: parameters,
    isLoading: isLoadingParameters,
    error: errorParameters,
  } = useMarketParameters({ chainId, marketId })

  const loading = !marketId || isLoadingParameters

  return (
    <>
      <ActionInfo
        testId="market-param-amm-swap-fee"
        label={t`AMM swap fee`}
        labelTooltip={{
          title: t`The LLAMMA fee applied when collateral is gradually converted across liquidation bands.`,
        }}
        value={formatNumber(parameters?.fee, 'percent.rate')}
        loading={loading}
        error={errorParameters}
      />

      <ActionInfo
        testId="market-param-admin-fee"
        label={t`Admin fee`}
        labelTooltip={{
          title: t`The share of market interest routed to the market admin or fee receiver instead of lenders.`,
        }}
        value={formatNumber(parameters?.admin_fee, 'percent.rate')}
        loading={loading}
        error={errorParameters}
      />

      <ActionInfo
        testId="market-param-band-width-factor"
        label={t`Band width factor`}
        labelTooltip={{
          title: t`A setting that controls how wide the liquidation bands are and how gradually soft liquidation plays out.`,
        }}
        value={formatNumber(parameters?.A, { abbreviate: false, useGrouping: false })}
        loading={loading}
        error={errorParameters}
      />

      <ActionInfo
        testId="market-param-loan-discount"
        label={t`Loan discount`}
        labelTooltip={{ title: t`A safety buffer that lowers the maximum amount you can borrow against collateral.` }}
        value={formatNumber(parameters?.loan_discount, 'percent.rate')}
        loading={loading}
        error={errorParameters}
      />

      <ActionInfo
        testId="market-param-liquidation-discount"
        label={t`Liquidation discount`}
        labelTooltip={{
          title: t`A discount given to liquidators to ensure prompt liquidation when positions enter hard liquidations.`,
        }}
        value={formatNumber(parameters?.liquidation_discount, 'percent.rate')}
        loading={loading}
        error={errorParameters}
      />

      <ActionInfo
        testId="market-param-max-ltv"
        label={t`Max LTV`}
        labelTooltip={{ title: t`The highest loan-to-value ratio allowed when opening or increasing a position.` }}
        value={formatNumber(getMaxLTV(parameters?.A, parameters?.loan_discount), 'percent.rate')}
        valueTooltip={t`Max possible loan at N=4`}
        loading={loading}
        error={errorParameters}
      />
    </>
  )
}
