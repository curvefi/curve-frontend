import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useState, useEffect } from 'react'

import useStore from '@/store/useStore'
import { convertToLocaleTimestamp, formatNumber } from '@/ui/utils'

import Button from '@/ui/Button'
import NumberField from './NumberField'
import MetricsComp, { MetricsColumnData } from '@/components/MetricsComp'
import Box from '@/ui/Box'
import { TooltipIcon } from '@/ui/Tooltip'

type VoteGaugeFieldProps = {
  powerUsed: number
  userGaugeVoteData: UserGaugeVoteWeight
  userVeCrv: number
  newVote?: boolean
}

const VoteGaugeField: React.FC<VoteGaugeFieldProps> = ({
  powerUsed,
  userGaugeVoteData,
  userVeCrv,
  newVote = false,
}) => {
  const [power, setPower] = useState(userGaugeVoteData.userPower / 100)
  const assignedPower = 100 - powerUsed
  const maxPower = newVote ? assignedPower / 100 : (assignedPower + userGaugeVoteData.userPower) / 100
  const availableVeCrv = userVeCrv * maxPower

  const { userAddress, getVoteForGaugeNextTime } = useStore((state) => state.user)
  const { castVote, castVoteLoading } = useStore((state) => state.gauges)

  const address = userAddress?.toLowerCase()
  const canVote = newVote
    ? true
    : userGaugeVoteData.nextVoteTime.timestamp && Date.now() > userGaugeVoteData.nextVoteTime.timestamp

  const loading = userGaugeVoteData.nextVoteTime.fetchingState === 'LOADING' || castVoteLoading === 'LOADING'

  const handleChangePower = (value: number) => {
    if (value > maxPower) {
      setPower(maxPower)
    } else {
      setPower(value)
    }
  }

  const handleCastVote = () => {
    if (!address) return
    castVote(address, userGaugeVoteData.gaugeAddress, power)
  }

  useEffect(() => {
    if (!address) return

    if (!newVote && userGaugeVoteData.nextVoteTime.fetchingState === null) {
      getVoteForGaugeNextTime(address, userGaugeVoteData.gaugeAddress)
    }
  }, [
    address,
    getVoteForGaugeNextTime,
    newVote,
    userGaugeVoteData.gaugeAddress,
    userGaugeVoteData.nextVoteTime.fetchingState,
  ])

  return (
    <Wrapper>
      {!newVote && (
        <Box flex flexColumn flexGap="var(--spacing-1)" margin="var(--spacing-3) 0 0">
          <GaugeVoteTitle>{t`USER GAUGE VOTE`}</GaugeVoteTitle>
          <Box flex flexGap="var(--spacing-3)" margin={'var(--spacing-2) 0'}>
            <Box flex flexColumn flexGap="var(--spacing-1)">
              <MetricsComp
                loading={false}
                title="Assigned voting power"
                data={
                  <MetricsColumnData>
                    {formatNumber(power * 100, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                  </MetricsColumnData>
                }
              />
              <AbsoluteData>
                {formatNumber(userGaugeVoteData.userVeCrv, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                veCRV
              </AbsoluteData>
            </Box>
            <Box flex flexColumn flexGap="var(--spacing-1)">
              <MetricsComp
                loading={false}
                title="Available voting power"
                data={
                  <MetricsColumnData>
                    {formatNumber(maxPower * 100, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                  </MetricsColumnData>
                }
              />
              <AbsoluteData>
                {formatNumber(availableVeCrv, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} veCRV
              </AbsoluteData>
            </Box>
          </Box>
        </Box>
      )}
      <Box flex flexDirection={newVote ? 'row' : 'column'} flexGap="var(--spacing-2)">
        <NumberField
          aria-label="Voting power input"
          label={
            newVote ? (
              <Box flex flexColumn flexGap={'var(--spacing-1)'}>
                <LabelTitle>{t`Available voting power:`}</LabelTitle>
                <LabelData>
                  <strong>
                    {formatNumber(assignedPower, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    %
                  </strong>{' '}
                  (
                  {formatNumber(availableVeCrv, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  veCRV)
                </LabelData>
              </Box>
            ) : null
          }
          value={power}
          onChange={handleChangePower}
          formatOptions={{ style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }}
          maxValue={maxPower}
        />
        {!newVote && (
          <AbsoluteData>
            {formatNumber(power * userVeCrv, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            veCRV
          </AbsoluteData>
        )}
        <ButtonWrapper>
          <StyledButton fillWidth disabled={!canVote} variant="filled" onClick={handleCastVote} loading={loading}>
            {newVote ? t`Vote` : t`Update Vote`}
          </StyledButton>
        </ButtonWrapper>
      </Box>
      {newVote && (
        <NewVoteAbsoluteData>
          {formatNumber(power * userVeCrv, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          veCRV
        </NewVoteAbsoluteData>
      )}
      {!canVote && !loading && userGaugeVoteData.nextVoteTime.timestamp && (
        <Box flex flexGap="var(--spacing-1)" flexAlignItems="center">
          <VoteOnCooldown>
            {t`Updating vote available on:`} <br />
            <strong>
              {new Date(
                convertToLocaleTimestamp(new Date(userGaugeVoteData.nextVoteTime.timestamp).getTime())
              ).toLocaleString()}
            </strong>
            <TooltipIcon>{t`You can only vote or update your vote once every 10 days.`}</TooltipIcon>
          </VoteOnCooldown>
        </Box>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: auto;
  margin-bottom: var(--spacing-1);
  align-items: center;
`

const GaugeVoteTitle = styled.h4`
  font-size: var(--font-size-2);
  border-bottom: 1px solid var(--gray-500a20);
  padding-bottom: var(--spacing-2);
  padding-top: var(--spacing-2);
`

const StyledButton = styled(Button)`
  padding: var(--spacing-1) var(--spacing-4);
`

const VoteOnCooldown = styled.p`
  font-size: var(--font-size-2);
  strong {
    margin-right: var(--spacing-1);
  }
`

const AbsoluteData = styled.p`
  font-size: var(--font-size-1);
  opacity: 0.7;
`

const NewVoteAbsoluteData = styled(AbsoluteData)`
  margin-top: var(--spacing-1);
`

const LabelTitle = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  opacity: 0.5;
`

const LabelData = styled.p``

export default VoteGaugeField
