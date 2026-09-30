import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const LendRateHeaderTooltipContent = ({ baseRate = false }: { baseRate?: boolean }) => {
  const beta = useNewLlamalendHealth()
  return (
    <TooltipWrapper>
      <TooltipDescription text={t`The annualized yield earned by lenders of the borrowable asset.`} />
      <TooltipDescription
        text={
          beta
            ? baseRate
              ? t`Supply APY is pool interest before token yield and rewards. Total APY beneath it includes eligible token yield and rewards.`
              : t`Total supply APY includes pool interest, intrinsic token yield and eligible rewards.`
            : t`May include both interest and external incentives.`
        }
      />
      {beta && (
        <TooltipDescription
          text={t`Token reward APRs are converted to APY assuming weekly reinvestment. Rewards do not compound automatically.`}
        />
      )}
      <TooltipDescription text={t`Does not apply to collateral.`} />
    </TooltipWrapper>
  )
}
