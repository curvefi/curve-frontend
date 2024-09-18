import styled from 'styled-components'
import { t } from '@lingui/macro'

import Button from '@/ui/Button'
import NumberField from './NumberField'
import Box from '@/ui/Box'

type VoteGaugeFieldProps = {
  availablePower: number
  userGaugeVoteData: UserGaugeVoteWeight
  newVote?: boolean
}

const VoteGaugeField: React.FC<VoteGaugeFieldProps> = ({ availablePower, userGaugeVoteData, newVote = false }) => {
  const formattedPower = userGaugeVoteData.userPower / 100

  return (
    <Wrapper>
      <Box flex flexGap="var(--spacing-2)">
        <NumberField
          row={newVote ? false : true}
          label={t`Available Power: ${100 - availablePower}%`}
          defaultValue={formattedPower}
          formatOptions={{ style: 'percent' }}
        />
        <ButtonWrapper>
          <Button variant="filled">{newVote ? t`Vote` : t`Update Vote`}</Button>
        </ButtonWrapper>
      </Box>
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

export default VoteGaugeField
