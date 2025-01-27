import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/dex/store/useStore'

import { checkFormReady } from '@/dex/components/PageCreatePool/utils'

import ConfirmModal from '@/dex/components/PageCreatePool/ConfirmModal'
import Box from '@ui/Box'
import PoolTypeSummary from '@/dex/components/PageCreatePool/Summary/PoolTypeSummary'
import TokensInPoolSummary from '@/dex/components/PageCreatePool/Summary/TokensInPoolSummary'
import ParametersSummary from '@/dex/components/PageCreatePool/Summary/ParametersSummary'
import PoolInfoSummary from '@/dex/components/PageCreatePool/Summary/PoolInfoSummary'
import { CurveApi, ChainId } from '@/dex/types/main.types'

type Props = {
  imageBaseUrl: string
  chainId: ChainId
  curve: CurveApi
}

const Summary = ({ imageBaseUrl, chainId, curve }: Props) => {
  const { advanced, validation } = useStore((state) => state.createPool)

  return (
    <Wrapper flex flexColumn>
      <TopBox>
        <h2>{t`Pool Summary`}</h2>
        <p className="mode">{advanced ? t`Advanced` : ''}</p>
      </TopBox>
      <SummaryBox>
        <PoolTypeSummary />
        <TokensInPoolSummary imageBaseUrl={imageBaseUrl} chainId={chainId} />
        <ParametersSummary chainId={chainId} />
        <PoolInfoSummary chainId={chainId} />
      </SummaryBox>
      <BottomBox flex>
        <ConfirmModal
          chainId={chainId}
          disabled={
            !checkFormReady(validation.poolType, validation.tokensInPool, validation.parameters, validation.poolInfo)
          }
          curve={curve}
          imageBaseUrl={imageBaseUrl}
        />
      </BottomBox>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  min-width: 350px;
  height: 100%;
`

const TopBox = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: var(--box_header--primary--background-color);
  padding: var(--spacing-normal);
  h2 {
    font-size: var(--font-size-4);
    color: var(--box--primary--color);
  }
  .mode {
    color: var(--box--primary--color);
    font-size: var(--font-size-2);
    font-weight: var(--bold);
  }
`

const SummaryBox = styled(Box)`
  padding: var(--spacing-normal);
  background: var(--box_header--secondary--background-color);
`

const BottomBox = styled(Box)`
  background: var(--box--secondary--content--background-color);
  padding: var(--spacing-3) var(--spacing-normal);
`

export default Summary
