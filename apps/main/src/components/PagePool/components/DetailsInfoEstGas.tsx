import React from 'react'

import { usePoolContext } from '@/components/PagePool/contextPool'

import DetailInfoEstGasComp from '@/components/DetailInfoEstGas'

type Props = {
  activeStep: number | null
  estimatedGas: EstimatedGas
  estimatedGasIsLoading: boolean
  isDivider?: boolean | undefined
  stepsLength: number
}

const DetailsInfoEstGas: React.FC<Props> = ({
  activeStep,
  estimatedGas,
  estimatedGasIsLoading,
  isDivider,
  stepsLength,
}) => {
  const { rChainId, signerAddress } = usePoolContext()

  return (
    <>
      {!!signerAddress && (
        <DetailInfoEstGasComp
          isDivider={isDivider}
          chainId={rChainId}
          estimatedGas={estimatedGas}
          loading={estimatedGasIsLoading}
          stepProgress={activeStep && stepsLength > 1 ? { active: activeStep, total: stepsLength } : null}
        />
      )}
    </>
  )
}

export default DetailsInfoEstGas
