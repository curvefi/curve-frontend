import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useState, useEffect } from 'react'

import networks from '@/networks'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import IconButton from '@/ui/IconButton'
import Icon from '@/ui/Icon'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import ErrorMessage from '@/components/ErrorMessage'
import InternalLinkButton from '@/components/InternalLinkButton'

import LineChartComponent from '@/components/Charts/LineChartComponent'
import TitleComp from '@/components/PageGauges/GaugeListItem/TitleComp'
import GaugeListColumns from '@/components/PageGauges/GaugeListItem/GaugeListColumns'
import GaugeWeightVotesColumns from '@/components/PageGauges/GaugeListItem/GaugeWeightVotesColumns'
import VoteGaugeField from '@/components/PageGauges/GaugeVoting/VoteGaugeField'
import GaugeDetails from '@/components/PageGauges/GaugeListItem/GaugeDetails'

type Props = {
  gaugeData: GaugeFormattedData
  gridTemplateColumns: string
  userGaugeWeightVoteData?: UserGaugeVoteWeight
  powerUsed?: number
  userGaugeVote?: boolean
  addUserVote?: boolean
}

const GaugeListItem = ({
  gaugeData,
  gridTemplateColumns,
  userGaugeWeightVoteData,
  powerUsed,
  userGaugeVote = false,
  addUserVote = false,
}: Props) => {
  const { gaugeWeightHistoryMapper, getHistoricGaugeWeights } = useStore((state) => state.gauges)
  const { veCrv } = useStore((state) => state.user.userVeCrv)
  const [open, setOpen] = useState(false)

  const imageBaseUrl = networks[1].imageBaseUrl
  const gaugeHistoryLoading =
    gaugeWeightHistoryMapper[gaugeData.address]?.loadingState === 'LOADING' ||
    !gaugeWeightHistoryMapper[gaugeData.address] ||
    (gaugeWeightHistoryMapper[gaugeData.address]?.data.length === 0 &&
      gaugeWeightHistoryMapper[gaugeData.address]?.loadingState !== 'ERROR')

  useEffect(() => {
    if (open && !gaugeWeightHistoryMapper[gaugeData.address]) {
      getHistoricGaugeWeights(gaugeData.address)
    }
  }, [gaugeData.address, gaugeWeightHistoryMapper, getHistoricGaugeWeights, open])

  return (
    <GaugeBox onClick={() => setOpen(!open)} addUserVote={addUserVote} open={open}>
      <DataComp gridTemplateColumns={gridTemplateColumns}>
        <TitleComp gaugeData={gaugeData} imageBaseUrl={imageBaseUrl} />
        {userGaugeWeightVoteData ? (
          <GaugeWeightVotesColumns userGaugeWeightVoteData={userGaugeWeightVoteData} />
        ) : (
          <GaugeListColumns gaugeData={gaugeData} />
        )}
        <StyledIconButton size="small">
          {open ? <Icon name="ChevronUp" size={16} /> : <Icon name="ChevronDown" size={16} />}
        </StyledIconButton>
      </DataComp>
      {open && (
        <OpenContainer
          onClick={(e?: React.MouseEvent) => {
            e?.stopPropagation()
          }}
        >
          <ChartWrapper>
            {userGaugeVote && powerUsed && userGaugeWeightVoteData && (
              <VoteGaugeFieldWrapper>
                <VoteGaugeField powerUsed={powerUsed} userVeCrv={+veCrv} userGaugeVoteData={userGaugeWeightVoteData} />
              </VoteGaugeFieldWrapper>
            )}
            {gaugeWeightHistoryMapper[gaugeData.address]?.loadingState === 'ERROR' && (
              <ErrorWrapper onClick={(e) => e.stopPropagation()}>
                <ErrorMessage
                  message={t`Error fetching historical gauge weights data`}
                  onClick={(e?: React.MouseEvent) => {
                    e?.stopPropagation()
                    getHistoricGaugeWeights(gaugeData.address)
                  }}
                />
              </ErrorWrapper>
            )}
            {gaugeHistoryLoading && (
              <StyledSpinnerWrapper>
                <Spinner size={16} />
              </StyledSpinnerWrapper>
            )}
            {gaugeWeightHistoryMapper[gaugeData.address]?.data.length !== 0 &&
              gaugeWeightHistoryMapper[gaugeData.address]?.loadingState === 'SUCCESS' && (
                <LineChartComponent height={400} data={gaugeWeightHistoryMapper[gaugeData.address]?.data} />
              )}
          </ChartWrapper>
          <GaugeDetails gaugeData={gaugeData} />
          <Box
            flex
            flexGap={'var(--spacing-3)'}
            flexAlignItems={'center'}
            margin={'var(--spacing-2) 0 var(--spacing-2) auto'}
          >
            <InternalLinkButton to={`/gauges/${gaugeData.address}`}>{t`VISIT GAUGE`}</InternalLinkButton>
          </Box>
        </OpenContainer>
      )}
    </GaugeBox>
  )
}

const GaugeBox = styled.div<{ addUserVote: boolean; open: boolean }>`
  display: grid;
  padding: calc(var(--spacing-2) + var(--spacing-1)) var(--spacing-3) calc(var(--spacing-2) + var(--spacing-1));
  gap: var(--spacing-1);
  border-bottom: 1px solid var(--gray-500a20);
  ${({ addUserVote }) => addUserVote && 'border: 1px solid inherit;'}
  &:hover {
    cursor: pointer;
    background-color: var(--table_row--hover--color);
    ${({ open }) => open && 'background-color: inherit;'}
  }
`

const DataComp = styled.div<{ gridTemplateColumns: string }>`
  display: grid;
  grid-template-columns: ${({ gridTemplateColumns }) => gridTemplateColumns};
`

const StyledIconButton = styled(IconButton)`
  margin-left: auto;
  margin-right: 0;
`

const OpenContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3) var(--spacing-1) 0;
  gap: var(--spacing-2);
  cursor: default;
`

const ChartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  width: 100%;
  @media (min-width: 45.625rem) {
    flex-direction: row;
  }
`

const VoteGaugeFieldWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  @media (min-width: 45.625rem) {
    width: 50%;
  }
`

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  height: 400px;
`

export default GaugeListItem
