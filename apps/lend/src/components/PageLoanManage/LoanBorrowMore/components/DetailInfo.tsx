import type { Step } from '@/ui/Stepper/types'

import React from 'react'
import useStore from '@/store/useStore'

import DetailInfoLiqRange from '@/components/DetailInfoLiqRange'
import DetailInfoHealth from '@/components/DetailInfoHealth'
import DetailInfoRate from '@/components/DetailInfoRate'
import DetailInfoEstimateGas from '@/components/DetailInfoEstimateGas'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const DetailInfo = ({
  rChainId,
  rOwmId,
  api,
  activeStep,
  healthMode,
  steps,
  userActiveKey,
  setHealthMode,
}: Pick<PageContentProps, 'rChainId' | 'rOwmId' | 'api' | 'market' | 'userActiveKey'> & {
  activeStep: number | null
  healthMode: HealthMode
  steps: Step[]
  setHealthMode: React.Dispatch<React.SetStateAction<HealthMode>>
}) => {
  const activeKey = useStore((state) => state.loanBorrowMore.activeKey)
  const detailInfo = useStore((state) => state.loanBorrowMore.detailInfo[activeKey])
  const formEstGas = useStore((state) => state.loanBorrowMore.formEstGas[activeKey])
  const formValues = useStore((state) => state.loanBorrowMore.formValues)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const { signerAddress } = api ?? {}

  return (
    <>
      {isAdvancedMode && (
        <DetailInfoLiqRange
          isManage
          rChainId={rChainId}
          rOwmId={rOwmId}
          {...detailInfo}
          healthMode={healthMode}
          userActiveKey={userActiveKey}
        />
      )}

      <DetailInfoHealth
        isManage
        rChainId={rChainId}
        rOwmId={rOwmId}
        {...detailInfo}
        amount={formValues.debt}
        formType=""
        healthMode={healthMode}
        userActiveKey={userActiveKey}
        setHealthMode={setHealthMode}
      />
      <DetailInfoRate isBorrow rChainId={rChainId} rOwmId={rOwmId} futureRates={detailInfo?.futureRates} />

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

export default DetailInfo
