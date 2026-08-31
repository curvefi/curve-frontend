import { useMemo } from 'react'
import { styled } from 'styled-components'
import { enforce, test } from 'vest'
import { useConnection } from 'wagmi'
import { MetricsColumnData, MetricsComp } from '@/dao/components/MetricsComp'
import { useUserGaugeVoteNextTimeQuery } from '@/dao/entities/user-gauge-vote-next-time'
import { ChainId, UserGaugeVoteWeight } from '@/dao/types/dao.types'
import { useForm, useFormSync } from '@evm-ui/features/forms'
import { useCurrentDate } from '@evm-ui/hooks/useCurrentDate'
import { t } from '@evm-ui/lib/i18n'
import { createValidationSuite } from '@evm-ui/lib/validation'
import { formatNumber } from '@evm-ui/utils'
import { Box } from '@legacy-ui/Box'
import { Button } from '@legacy-ui/Button'
import { TooltipIcon } from '@legacy-ui/Tooltip/TooltipIcon'
import { formatDate } from '@legacy-ui/utils'
import { useGaugeVoteMutation } from '../gauge-vote.mutation'
import { NumberField } from './NumberField'

type VoteGaugeFieldProps = {
  chainId: ChainId
  powerUsed: number
  userGaugeVoteData: UserGaugeVoteWeight
  userVeCrv: number
  newVote?: boolean
}

type VoteGaugeFormValues = {
  gaugeAddress: string
  voteWeight: number
}

const voteGaugeFormValidationSuite = createValidationSuite(({ voteWeight }: VoteGaugeFormValues) => {
  test('voteWeight', () => {
    enforce(voteWeight).isNumber().greaterThanOrEquals(0)
  })
})

export const VoteGaugeField = ({
  chainId,
  powerUsed,
  userGaugeVoteData,
  userVeCrv,
  newVote = false,
}: VoteGaugeFieldProps) => {
  const { address: userAddress } = useConnection()
  const { userPower, gaugeAddress } = userGaugeVoteData
  const { data: userGaugeVoteNextTime, isLoading: nextVoteTimeLoading } = useUserGaugeVoteNextTimeQuery({
    chainId,
    gaugeAddress,
    userAddress,
  })
  const defaultValues = useMemo(
    () => ({
      gaugeAddress,
      voteWeight: userPower / 100,
    }),
    [gaugeAddress, userPower],
  )
  const form = useForm<VoteGaugeFormValues>({ defaultValues, validation: voteGaugeFormValidationSuite })
  useFormSync(form, defaultValues)
  const { voteWeight } = form.watchValues()
  const vote = useGaugeVoteMutation({ chainId, onReset: () => form.reset(defaultValues), userAddress })
  const currentDate = useCurrentDate()
  const canVote = !userGaugeVoteNextTime || currentDate.getTime() > userGaugeVoteNextTime
  const availablePower = 100 - powerUsed
  const maxPower = newVote ? availablePower / 100 : (availablePower + userPower) / 100
  const availableVeCrv = userVeCrv * (availablePower / 100)

  const loading = nextVoteTimeLoading || vote.isPending

  return (
    <Wrapper>
      {!newVote && (
        <Box flex flexColumn flexGap="var(--spacing-1)" margin="var(--spacing-3) 0 0">
          <GaugeVoteTitle>{t`USER GAUGE VOTE`}</GaugeVoteTitle>
          <Box flex flexGap="var(--spacing-3)" margin="var(--spacing-2) 0">
            <Box flex flexColumn flexGap="var(--spacing-1)">
              <MetricsComp
                loading={false}
                title="Assigned voting power"
                data={
                  <MetricsColumnData>
                    {formatNumber(userPower, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                      abbreviate: false,
                    })}
                    %
                  </MetricsColumnData>
                }
              />
              <AbsoluteData>
                {formatNumber(userGaugeVoteData.userVeCrv, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  abbreviate: false,
                })}{' '}
                veCRV
              </AbsoluteData>
            </Box>
            <Box flex flexColumn flexGap="var(--spacing-1)">
              <MetricsComp
                loading={false}
                title="Available voting power"
                data={
                  <MetricsColumnData>
                    {formatNumber(availablePower, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                      abbreviate: false,
                    })}
                    %
                  </MetricsColumnData>
                }
              />
              <AbsoluteData>
                {formatNumber(availableVeCrv, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  abbreviate: false,
                })}{' '}
                veCRV
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
              <Box flex flexColumn flexGap="var(--spacing-1)">
                <LabelTitle>{t`Available voting power:`}</LabelTitle>
                <LabelData>
                  <strong>
                    {formatNumber(availablePower, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                      abbreviate: false,
                    })}
                    %
                  </strong>{' '}
                  (
                  {formatNumber(availableVeCrv, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    abbreviate: false,
                  })}{' '}
                  veCRV)
                </LabelData>
              </Box>
            ) : null
          }
          value={voteWeight}
          onChange={(value: number) => form.update({ voteWeight: value > maxPower ? maxPower : value })}
          formatOptions={{ style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }}
          maxValue={maxPower}
        />
        {!newVote && (
          <AbsoluteData>
            {formatNumber(voteWeight * userVeCrv, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              abbreviate: false,
            })}{' '}
            veCRV
          </AbsoluteData>
        )}
        <ButtonWrapper>
          <StyledButton
            fillWidth
            disabled={!canVote || !form.formState.isValid}
            variant="filled"
            onClick={() => void form.handleSubmit(values => vote.onSubmit(values))()}
            loading={loading}
          >
            {newVote ? t`Vote` : t`Update Vote`}
          </StyledButton>
        </ButtonWrapper>
      </Box>
      {newVote && (
        <NewVoteAbsoluteData>
          {formatNumber(voteWeight * userVeCrv, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            abbreviate: false,
          })}{' '}
          veCRV
        </NewVoteAbsoluteData>
      )}
      {!canVote && !loading && userGaugeVoteNextTime && (
        <Box flex flexGap="var(--spacing-1)" flexAlignItems="center">
          <VoteOnCooldown>
            {t`Updating vote available on:`} <br />
            <strong>{formatDate(userGaugeVoteNextTime, 'long')}</strong>
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
