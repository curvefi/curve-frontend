import { Dispatch, SetStateAction } from 'react'
import { DetailInfoEstimateGas } from '@/lend/components/DetailInfoEstimateGas'
import { DetailInfoHealth } from '@/lend/components/DetailInfoHealth'
import { DetailInfoLiqRange } from '@/lend/components/DetailInfoLiqRange'
import { DetailInfoRate } from '@/lend/components/DetailInfoRate'
import { useStore } from '@/lend/store/useStore'
import { PageContentProps } from '@/lend/types/lend.types'
import type { HealthMode } from '@/llamalend/llamalend.types'
import type { Step } from '@ui/Stepper/types'

export const DetailInfo = ({
  rChainId,
  marketId,
  api,
  activeStep,
  healthMode,
  steps,
  userActiveKey,
  setHealthMode,
}: Pick<PageContentProps, 'rChainId' | 'marketId' | 'api' | 'market' | 'userActiveKey'> & {
  activeStep: number | null
  healthMode: HealthMode
  steps: Step[]
  setHealthMode: Dispatch<SetStateAction<HealthMode>>
}) => {
  const activeKey = useStore(state => state.loanBorrowMore.activeKey)
  const detailInfo = useStore(state => state.loanBorrowMore.detailInfo[activeKey])
  const formEstGas = useStore(state => state.loanBorrowMore.formEstGas[activeKey])
  const formValues = useStore(state => state.loanBorrowMore.formValues)

  const { signerAddress } = api ?? {}

  return (
    <>
      <DetailInfoLiqRange
        isManage
        rChainId={rChainId}
        marketId={marketId}
        {...detailInfo}
        healthMode={healthMode}
        userActiveKey={userActiveKey}
      />

      <DetailInfoHealth
        isManage
        rChainId={rChainId}
        marketId={marketId}
        {...detailInfo}
        amount={formValues.debt}
        formType=""
        healthMode={healthMode}
        userActiveKey={userActiveKey}
        setHealthMode={setHealthMode}
      />
      <DetailInfoRate isBorrow rChainId={rChainId} marketId={marketId} futureRates={detailInfo?.futureRates} />

      {signerAddress && (
        <DetailInfoEstimateGas
          isDivider
          chainId={rChainId}
          {...formEstGas}
          stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
        />
      )}
    </>
  )
}
