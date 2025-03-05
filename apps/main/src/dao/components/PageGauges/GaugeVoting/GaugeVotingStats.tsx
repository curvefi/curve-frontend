import styled from 'styled-components'
import { t } from '@ui-kit/lib/i18n'
import useStore from '@/dao/store/useStore'
import { formatNumber, shortenTokenAddress } from '@ui/utils'
import { calculateUserPowerStale } from './utils'
import Box from '@ui/Box'
import MetricsComp, { MetricsColumnData } from '@/dao/components/MetricsComp'
import ComboBoxSelectGauge from '@/dao/components/ComboBoxSelectGauge'
import InternalLink from '@ui/Link/InternalLink'
import AlertBox from '@ui/AlertBox'

const GaugeVotingStats = ({ userAddress }: { userAddress: string }) => {
  const { userEns, userVeCrv } = useStore((state) => state.user)
  const userData = useStore((state) => state.user.userGaugeVoteWeightsMapper[userAddress?.toLowerCase() ?? ''])

  const userWeightsLoading = !userData || userData?.fetchingState === 'LOADING'

  const isUserPowerStale = calculateUserPowerStale(+userVeCrv.veCrv, userData?.data.powerUsed, userData?.data.veCrvUsed)

  return (
    <UserDataWrapper>
      <Box flex flexWrap="wrap" flexGap="var(--spacing-3)" flexJustifyContent="space-between">
        <MetricsComp
          loading={userWeightsLoading}
          title="User"
          data={
            <StyledInternalLink href={`/ethereum/user/${userAddress}`}>
              <MetricsColumnData>{userEns ?? shortenTokenAddress(userAddress)}</MetricsColumnData>
            </StyledInternalLink>
          }
        />
        <MetricsComp
          loading={userWeightsLoading}
          title="Power used"
          data={<MetricsColumnData>{userData?.data.powerUsed}%</MetricsColumnData>}
        />
        <MetricsComp
          loading={userWeightsLoading}
          title="veCRV"
          data={
            <MetricsColumnData>
              {formatNumber(userVeCrv.veCrv, { showDecimalIfSmallNumberOnly: true })}
            </MetricsColumnData>
          }
        />
        <MetricsComp
          loading={userWeightsLoading}
          title="veCRV used"
          data={
            <MetricsColumnData>
              {formatNumber(userData?.data.veCrvUsed, { showDecimalIfSmallNumberOnly: true })}
            </MetricsColumnData>
          }
        />
        <ComboBoxSelectGauge title={''} />
      </Box>
      {isUserPowerStale && <AlertBox alertType="info">{t`You have more power! Update gauges to unlock it.`}</AlertBox>}
    </UserDataWrapper>
  )
}

const UserDataWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--spacing-3);
`

const StyledInternalLink = styled(InternalLink)`
  text-decoration: none;
  color: inherit;
  text-transform: none;
`

export default GaugeVotingStats
