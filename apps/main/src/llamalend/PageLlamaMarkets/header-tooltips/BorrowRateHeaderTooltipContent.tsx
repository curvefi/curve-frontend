import { t } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'

export default (
  <TooltipWrapper>
    <TooltipDescription
      text={t`The borrow rate is the cost related to your borrow. Depending on the market type it is correlated to different variables.`}
    />
    <TooltipDescription
      text={
        <>
          {t`For`} <strong>{t`lending markets`}</strong> {t`it varies according to the market utilization.`}
        </>
      }
    />
    <TooltipDescription
      text={
        <>
          {t`For`} <strong>{t`minting markets`}</strong> {t`it varies according to the the peg of`}{' '}
          <em>{t`crvUSD`}.</em>
        </>
      }
    />
    <TooltipDescription
      text={t`Collateral does not earn this rate. Intrinsic yield of LSTs is not taken into account for borrow rates.`}
    />
  </TooltipWrapper>
)
