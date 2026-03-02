import { TooltipDescription, TooltipWrapper } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t, Trans } from '@ui-kit/lib/i18n'

export const TvlHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={
        <Trans>
          <strong>The combined USD value of all assets in the market.</strong>
        </Trans>
      }
    />
    <TooltipDescription text={t`Represents the total capital secured and active in this market.`} />
    <TooltipDescription
      text={
        <Trans>
          For mint markets it is calculated as: <strong>(total collateral value)</strong>
        </Trans>
      }
    />
    <TooltipDescription
      text={
        <Trans>
          For lending markets it is calculated as:{' '}
          <strong>(collateral held in the AMM + available vault liquidity)</strong>
        </Trans>
      }
    />
  </TooltipWrapper>
)
