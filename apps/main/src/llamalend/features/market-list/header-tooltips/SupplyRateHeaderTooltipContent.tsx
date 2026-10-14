import type { ReactNode } from 'react'
import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'
import { COMPOUNDING_CATEGORIES } from '@ui/lib/rates.utils'

const SupplyRateTooltip = ({ children }: { children: ReactNode }) => (
  <TooltipWrapper>
    <TooltipDescription text={t`The annualized yield earned by lenders of the borrowable asset.`} />
    {children}
    <TooltipDescription
      text={t`Token reward APRs are converted to APY assuming ${COMPOUNDING_CATEGORIES['llamalend.rewards'].adjective} reinvestment. Rewards do not compound automatically.`}
    />
    <TooltipDescription text={t`Does not apply to collateral.`} />
  </TooltipWrapper>
)

export const SupplyRateHeaderTooltipContent = () => (
  <SupplyRateTooltip>
    <TooltipDescription
      text={t`Supply APY is pool interest before token yield and rewards. Total APY beneath it includes eligible token yield and rewards.`}
    />
  </SupplyRateTooltip>
)

export const NetSupplyRateHeaderTooltipContent = () => (
  <SupplyRateTooltip>
    <TooltipDescription
      text={t`Total supply APY includes pool interest, intrinsic token yield and eligible rewards.`}
    />
  </SupplyRateTooltip>
)
