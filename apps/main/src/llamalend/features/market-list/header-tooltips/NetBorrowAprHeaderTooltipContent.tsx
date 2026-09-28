import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { MarketType } from '@evm-ui/types/market'
import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t, Trans } from '@ui/lib/i18n'
import { BORROW_APR_DESCRIPTION } from './constants'

export const NetBorrowAprHeaderTooltipContent = () => {
  const beta = useNewLlamalendHealth()
  return (
    <TooltipWrapper>
      {beta ? (
        <>
          <TooltipDescription
            text={t`Borrow APR is the interest charged on the debt. It follows the market's monetary policy. On mint markets it also follows crvUSD's peg and borrow incentives. It does not include collateral yield.`}
          />
          <TooltipDescription
            text={t`Estimated net borrow APR subtracts collateral yield and incentives from Borrow APR. That estimate is a same-asset comparison only when the yield is paid in the debt asset. When it is not, as with wstETH yield against crvUSD debt, it is not the borrow cost.`}
          />
        </>
      ) : (
        <>
          <TooltipDescription
            text={
              <Trans>
                <strong>
                  The net borrow APR is the cost related to your borrow. Depending on the market type it is correlated
                  to different variables.
                </strong>
              </Trans>
            }
          />
          <TooltipDescription text={BORROW_APR_DESCRIPTION[MarketType.Lend]} />
          <TooltipDescription text={BORROW_APR_DESCRIPTION[MarketType.Mint]} />
          <TooltipDescription
            text={
              <Trans>
                Collateral does <strong>not</strong> earn this rate. Intrinsic yield of LSTs & token rewards are taken
                into account for net borrow APR.
              </Trans>
            }
          />
        </>
      )}
    </TooltipWrapper>
  )
}
