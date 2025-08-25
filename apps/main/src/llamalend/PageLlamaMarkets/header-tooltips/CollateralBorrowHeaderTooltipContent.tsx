import { t } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'

export const CollateralBorrowHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`The pair of assets in this market.`} />
    <TooltipDescription
      text={
        <>
          {t`The first asset is the collateral used to borrow.`}
          <br />
          {t`The second is the asset you can either borrow or lend.`}
        </>
      }
    />
    <TooltipDescription
      text={
        <>
          <em>{t`Note`}</em>
          {': '}
          {t`Some markets may not support lending and only allow borrowing (minting). Lending availability is shown by a non-zero Supply Rate.`}
        </>
      }
    />
  </TooltipWrapper>
)
