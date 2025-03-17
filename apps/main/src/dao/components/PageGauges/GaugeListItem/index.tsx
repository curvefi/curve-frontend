import { MouseEvent, useEffect, useState } from 'react'
import styled from 'styled-components'
import LineChartComponent from '@/dao/components/Charts/LineChartComponent'
import ErrorMessage from '@/dao/components/ErrorMessage'
import ExternalLinkIconButton from '@/dao/components/ExternalLinkIconButton'
import InternalLinkButton from '@/dao/components/InternalLinkButton'
import GaugeDetails from '@/dao/components/PageGauges/GaugeListItem/GaugeDetails'
import GaugeListColumns from '@/dao/components/PageGauges/GaugeListItem/GaugeListColumns'
import GaugeWeightVotesColumns from '@/dao/components/PageGauges/GaugeListItem/GaugeWeightVotesColumns'
import TitleComp from '@/dao/components/PageGauges/GaugeListItem/TitleComp'
import VoteGaugeField from '@/dao/components/PageGauges/GaugeVoting/VoteGaugeField'
import useStore from '@/dao/store/useStore'
import { GaugeFormattedData, UserGaugeVoteWeight } from '@/dao/types/dao.types'
import Box from '@ui/Box'
import Button from '@ui/Button'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'

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
  const gaugeWeightHistoryMapper = useStore((state) => state.gauges.gaugeWeightHistoryMapper)
  const getHistoricGaugeWeights = useStore((state) => state.gauges.getHistoricGaugeWeights)
  const gaugeCurveApiData = useStore(
    (state) =>
      state.gauges.gaugeCurveApiData.data[
        gaugeData.effective_address?.toLowerCase() ?? gaugeData.address.toLowerCase()
      ],
  )
  const userVeCrv = useStore((state) => state.user.userVeCrv)
  const [open, setOpen] = useState(false)

  const gaugeHistoryLoading =
    gaugeWeightHistoryMapper[gaugeData.address]?.loadingState === 'LOADING' ||
    !gaugeWeightHistoryMapper[gaugeData.address] ||
    (gaugeWeightHistoryMapper[gaugeData.address]?.data.length === 0 &&
      gaugeWeightHistoryMapper[gaugeData.address]?.loadingState !== 'ERROR')
  const gaugeExternalLink = gaugeCurveApiData?.isPool
    ? gaugeCurveApiData.poolUrls.deposit[0]
    : gaugeCurveApiData?.lendingVaultUrls.deposit

  useEffect(() => {
    if (open && !gaugeWeightHistoryMapper[gaugeData.address]) {
      getHistoricGaugeWeights(gaugeData.address)
    }
  }, [gaugeData.address, gaugeWeightHistoryMapper, getHistoricGaugeWeights, open])

  return (
    <GaugeBox onClick={() => setOpen(!open)} addUserVote={addUserVote} open={open}>
      <DataComp gridTemplateColumns={gridTemplateColumns}>
        <TitleComp gaugeData={gaugeData} />
        {userGaugeWeightVoteData ? (
          <GaugeWeightVotesColumns userGaugeWeightVoteData={userGaugeWeightVoteData} />
        ) : (
          <GaugeListColumns gaugeData={gaugeData} />
        )}
        <Box flex flexJustifyContent="flex-end" flexAlignItems="center" margin="0 0 0 auto">
          {userGaugeWeightVoteData?.canVote && (
            <UpdateGaugeIndicator variant="select-flat">{t`Update`}</UpdateGaugeIndicator>
          )}
          <StyledIconButton size="small">
            {open ? <Icon name="ChevronUp" size={16} /> : <Icon name="ChevronDown" size={16} />}
          </StyledIconButton>
        </Box>
      </DataComp>
      {open && (
        <OpenContainer
          onClick={(e?: MouseEvent) => {
            e?.stopPropagation()
          }}
        >
          <ChartWrapper>
            {userGaugeVote && powerUsed && userGaugeWeightVoteData && (
              <VoteGaugeFieldWrapper>
                <VoteGaugeField
                  powerUsed={powerUsed}
                  userVeCrv={+userVeCrv}
                  userGaugeVoteData={userGaugeWeightVoteData}
                />
              </VoteGaugeFieldWrapper>
            )}
            {gaugeWeightHistoryMapper[gaugeData.address]?.loadingState === 'ERROR' && (
              <ErrorWrapper onClick={(e) => e.stopPropagation()}>
                <ErrorMessage
                  message={t`Error fetching historical gauge weights data`}
                  onClick={(e?: MouseEvent) => {
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
            <ExternalLinkIconButton
              href={gaugeExternalLink}
              tooltip={t`Visit gauge ${gaugeCurveApiData?.isPool ? 'pool' : 'market'}`}
            >
              {t`VISIT ${gaugeCurveApiData?.isPool ? 'POOL' : 'MARKET'}`}
            </ExternalLinkIconButton>
            <InternalLinkButton to={`${DAO_ROUTES.PAGE_GAUGES}/${gaugeData.effective_address}`}>
              {t`VISIT GAUGE`}
            </InternalLinkButton>
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

const UpdateGaugeIndicator = styled(Button)`
  padding: var(--spacing-1) var(--spacing-2);
  /* background-color: var(--warning-400);
  color: var(--page--text-color); */
  font-weight: var(--bold);
  font-size: var(--font-size-1);
`

export default GaugeListItem
