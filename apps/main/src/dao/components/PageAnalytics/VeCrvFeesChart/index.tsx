import { styled } from 'styled-components'
import { DAO_CHART_HEIGHT } from '@/dao/components/Charts/constants'
import type { VeCrvFee } from '@/dao/entities/vecrv-fees'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'
import { ChartStateWrapper } from '@ui-kit/shared/ui/Chart'
import { FeesBarChart } from './FeesBarChart'

export const VECRV_FEES_CHART_WEEKS = 52

export const VeCrvFeesChart = ({ data }: { data: VeCrvFee[] }) => (
  <Wrapper>
    <TitleRow>
      <BoxTitle>{t`veCRV Fees Last ${VECRV_FEES_CHART_WEEKS} Weeks`}</BoxTitle>
    </TitleRow>
    <Content>
      <ChartStateWrapper
        height={DAO_CHART_HEIGHT}
        isLoading={false}
        isEmpty={data.length === 0}
        error={null}
        errorMessage={t`Unable to fetch veCRV fees data.`}
      >
        <FeesBarChart height={DAO_CHART_HEIGHT} data={data} />
      </ChartStateWrapper>
    </Content>
  </Wrapper>
)

const Wrapper = styled(Box)`
  width: 100%;
  margin-bottom: auto;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
`

const BoxTitle = styled.h4`
  font-size: var(--font-size-3);
  font-weight: bold;
`

const Content = styled.div`
  padding: 0 var(--spacing-3) var(--spacing-3);
`
