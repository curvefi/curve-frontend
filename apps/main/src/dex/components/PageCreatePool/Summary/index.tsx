import { styled } from 'styled-components'
import { ConfirmModal } from '@/dex/components/PageCreatePool/ConfirmModal'
import { ParametersSummary } from '@/dex/components/PageCreatePool/Summary/ParametersSummary'
import { PoolInfoSummary } from '@/dex/components/PageCreatePool/Summary/PoolInfoSummary'
import { PoolTypeSummary } from '@/dex/components/PageCreatePool/Summary/PoolTypeSummary'
import { TokensInPoolSummary } from '@/dex/components/PageCreatePool/Summary/TokensInPoolSummary'
import { checkFormReady } from '@/dex/components/PageCreatePool/utils'
import { useStore } from '@/dex/store/useStore'
import { CurveApi, ChainId } from '@/dex/types/main.types'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  blockchainId: string
  chainId: ChainId
  curve: CurveApi
}

export const Summary = ({ blockchainId, chainId, curve }: Props) => {
  const advanced = useStore((state) => state.createPool.advanced)
  const validationPoolType = useStore((state) => state.createPool.validation.poolType)
  const validationTokensInPool = useStore((state) => state.createPool.validation.tokensInPool)
  const validationParameters = useStore((state) => state.createPool.validation.parameters)
  const validationPoolInfo = useStore((state) => state.createPool.validation.poolInfo)

  return (
    <Wrapper flex flexColumn>
      <TopBox>
        <h2>{t`Pool Summary`}</h2>
        <p className="mode">{advanced ? t`Advanced` : ''}</p>
      </TopBox>
      <SummaryBox>
        <PoolTypeSummary />
        <TokensInPoolSummary blockchainId={blockchainId} chainId={chainId} />
        <ParametersSummary chainId={chainId} />
        <PoolInfoSummary />
      </SummaryBox>
      <BottomBox flex>
        <ConfirmModal
          chainId={chainId}
          disabled={
            !checkFormReady(validationPoolType, validationTokensInPool, validationParameters, validationPoolInfo)
          }
          curve={curve}
          blockchainId={blockchainId}
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
  color: var(--box_header--primary--color);
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
  background: var(--box--primary--content--background-color);
`

const BottomBox = styled(Box)`
  background: var(--box--secondary--content--background-color);
  padding: var(--spacing-3) var(--spacing-normal);
`
