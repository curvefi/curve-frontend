import styled from 'styled-components'
import ComboBoxSelectGauge from '@/dao/components/ComboBoxSelectGauge'
import MetricsComp, { MetricsColumnData } from '@/dao/components/MetricsComp'
import useStore from '@/dao/store/useStore'
import { getEthPath } from '@/dao/utils'
import AlertBox from '@ui/AlertBox'
import Box from '@ui/Box'
import InternalLink from '@ui/Link/InternalLink'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { shortenAddress } from '@ui-kit/utils'
import { calculateUserPowerStale } from './utils'

const GaugeVotingStats = ({ userAddress }: { userAddress: string }) => {
  const userEns = useStore((state) => state.user.userEns)
  const userVeCrv = useStore((state) => state.user.userVeCrv)
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
            <StyledInternalLink href={getEthPath(`${DAO_ROUTES.PAGE_USER}/${userAddress}`)}>
              <MetricsColumnData>{userEns ?? shortenAddress(userAddress)}</MetricsColumnData>
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
`

export default GaugeVotingStats
