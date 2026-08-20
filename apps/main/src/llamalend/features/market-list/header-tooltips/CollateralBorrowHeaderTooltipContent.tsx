import { t, Trans } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'

export const CollateralBorrowHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`The pair of assets in this market.`} />
    <TooltipDescription
      text={
        <Trans>
          The first asset is the collateral used to borrow.
          <br />
          The second is the asset you can either borrow or lend.
        </Trans>
      }
    />
    <TooltipDescription
      text={
        <Trans>
          <em>Note</em>: Some markets may not support lending and only allow borrowing (minting). Lending availability
          is shown by a non-zero Supply Rate.
        </Trans>
      }
    />
  </TooltipWrapper>
)
