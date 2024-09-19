import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useState, useEffect } from 'react'

import useStore from '@/store/useStore'
import { convertToLocaleTimestamp } from '@/ui/utils'

import Button from '@/ui/Button'
import NumberField from './NumberField'
import Box from '@/ui/Box'
import { TooltipIcon } from '@/ui/Tooltip'

type VoteGaugeFieldProps = {
  availablePower: number
  userGaugeVoteData: UserGaugeVoteWeight
  newVote?: boolean
}

const VoteGaugeField: React.FC<VoteGaugeFieldProps> = ({ availablePower, userGaugeVoteData, newVote = false }) => {
  const [power, setPower] = useState(userGaugeVoteData.userPower / 100)
  const maxPower = newVote ? 100 - availablePower : 100 - availablePower + userGaugeVoteData.userPower

  const { userAddress, getVoteForGaugeNextTime } = useStore((state) => state.user)
  const { castVote, castVoteLoading } = useStore((state) => state.gauges)

  const address = userAddress?.toLowerCase()
  const canVote = newVote
    ? true
    : userGaugeVoteData.nextVoteTime.timestamp && Date.now() > userGaugeVoteData.nextVoteTime.timestamp

  const loading = userGaugeVoteData.nextVoteTime.fetchingState === 'LOADING' || castVoteLoading === 'LOADING'

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
      <Box flex flexGap="var(--spacing-2)">
        <NumberField
          row={newVote ? false : true}
          label={t`Available Power: ${maxPower}%`}
          defaultValue={power}
          onChange={setPower}
          formatOptions={{ style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }}
          maxValue={maxPower / 100}
        />
        <ButtonWrapper>
          <StyledButton disabled={!canVote} variant="filled" onClick={handleCastVote} loading={loading}>
            {newVote ? t`Vote` : t`Update Vote`}
          </StyledButton>
        </ButtonWrapper>
      </Box>
      {!canVote && !loading && userGaugeVoteData.nextVoteTime.timestamp && (
        <Box flex flexGap="var(--spacing-1)" flexAlignItems="center">
          <VoteOnCooldown>
            {t`Next vote available on:`}{' '}
            <span>
              {new Date(
                convertToLocaleTimestamp(new Date(userGaugeVoteData.nextVoteTime.timestamp).getTime())
              ).toLocaleString()}
            </span>
          </VoteOnCooldown>
          <TooltipIcon>{t`You can only vote or update your vote once every 10 days.`}</TooltipIcon>
        </Box>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  width: 100%;
`

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: auto;
  margin-bottom: var(--spacing-1);
  align-items: center;
`

const StyledButton = styled(Button)`
  padding: var(--spacing-1) var(--spacing-4);
`

const VoteOnCooldown = styled.p`
  padding-left: var(--spacing-2);
  font-size: var(--font-size-2);
  align-self: flex-end;
  span {
    font-weight: var(--semi-bold);
  }
`

export default VoteGaugeField
