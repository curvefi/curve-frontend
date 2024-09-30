import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useState, useEffect } from 'react'

import networks from '@/networks'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import IconButton from '@/ui/IconButton'
import Icon from '@/ui/Icon'
import LineChartComponent from '@/components/Charts/LineChartComponent'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import ErrorMessage from '@/components/ErrorMessage'
import TitleComp from './TitleComp'
import GaugeListColumns from './GaugeListColumns'
import GaugeWeightVotesColumns from './GaugeWeightVotesColumns'
import InternalLinkButton from '@/components/InternalLinkButton'
import VoteGaugeField from '../GaugeVoting/VoteGaugeField'
import GaugeDetails from './GaugeDetails'

type Props = {
  gaugeData: GaugeFormattedData
  gridTemplateColumns: string
  userGaugeWeightVoteData?: UserGaugeVoteWeight
  availablePower?: number
  userGaugeVote?: boolean
  addUserVote?: boolean
}

const GaugeListItem = ({
  gaugeData,
  gridTemplateColumns,
  userGaugeWeightVoteData,
  availablePower,
  userGaugeVote = false,
  addUserVote = false,
}: Props) => {
  const { gaugeWeightHistoryMapper, getHistoricGaugeWeights } = useStore((state) => state.gauges)
  const [open, setOpen] = useState(false)

  const imageBaseUrl = networks[1].imageBaseUrl

  useEffect(() => {
    if (open && !gaugeWeightHistoryMapper[gaugeData.address]) {
      getHistoricGaugeWeights(gaugeData.address)
    }
  }, [gaugeData.address, gaugeWeightHistoryMapper, getHistoricGaugeWeights, open])

  return (
    <GaugeBox onClick={() => setOpen(!open)} addUserVote={addUserVote}>
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
        <OpenContainer>
          {userGaugeVote && availablePower && userGaugeWeightVoteData && (
            <Box
              margin={'0 0 var(--spacing-3) 0'}
              flex
              flexJustifyContent={'center'}
              flexAlignItems={'center'}
              onClick={(e?: React.MouseEvent) => {
                e?.stopPropagation()
              }}
            >
              <VoteGaugeField availablePower={availablePower} userGaugeVoteData={userGaugeWeightVoteData} />
            </Box>
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
          {(gaugeWeightHistoryMapper[gaugeData.address]?.loadingState === 'LOADING' ||
            !gaugeWeightHistoryMapper[gaugeData.address] ||
            (gaugeWeightHistoryMapper[gaugeData.address]?.data.length === 0 &&
              gaugeWeightHistoryMapper[gaugeData.address]?.loadingState !== 'ERROR')) && (
            <StyledSpinnerWrapper>
              <Spinner size={16} />
            </StyledSpinnerWrapper>
          )}
          {gaugeWeightHistoryMapper[gaugeData.address]?.data.length !== 0 &&
            gaugeWeightHistoryMapper[gaugeData.address]?.loadingState === 'SUCCESS' && (
              <LineChartComponent height={400} data={gaugeWeightHistoryMapper[gaugeData.address]?.data} />
            )}
          <GaugeDetails gaugeData={gaugeData} />
          <Box flex flexGap={'var(--spacing-3)'} flexAlignItems={'center'} margin={'auto auto auto 0'}>
            <InternalLinkButton to={`/gauges/${gaugeData.address}`}>{t`VIEW GAUGE`}</InternalLinkButton>
          </Box>
        </OpenContainer>
      )}
    </GaugeBox>
  )
}

const GaugeBox = styled.div<{ addUserVote: boolean }>`
  display: grid;
  padding: var(--spacing-2) 0 calc(var(--spacing-2) + var(--spacing-1));
  gap: var(--spacing-1);
  border-bottom: 1px solid var(--gray-500a20);
  ${({ addUserVote }) => addUserVote && 'border: 1px solid inherit;'}
  &:hover {
    cursor: pointer;
  }
  &:last-child {
    border-bottom: none;
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
