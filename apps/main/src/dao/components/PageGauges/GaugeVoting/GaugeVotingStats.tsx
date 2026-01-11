import { styled } from 'styled-components'
import type { Address } from 'viem'
import { useEnsName } from 'wagmi'
import { ComboBoxGauges as ComboBoxSelectGauge } from '@/dao/components/ComboBoxSelectGauge'
import { MetricsColumnData, MetricsComp } from '@/dao/components/MetricsComp'
import { useUserGaugeWeightVotesQuery } from '@/dao/entities/user-gauge-weight-votes'
import { useStore } from '@/dao/store/useStore'
import { getEthPath } from '@/dao/utils'
import { AlertBox } from '@ui/AlertBox'
import { Box } from '@ui/Box'
import { InternalLink } from '@ui/Link/InternalLink'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { shortenAddress } from '@ui-kit/utils'
import { Chain } from '@ui-kit/utils/network'
import { calculateUserPowerStale } from './utils'

export const GaugeVotingStats = ({ userAddress }: { userAddress: string }) => {
  const { data: userGaugeWeightVotes, isLoading: userGaugeWeightsLoading } = useUserGaugeWeightVotesQuery({
    chainId: Chain.Ethereum, // DAO is only used on mainnet
    userAddress: userAddress ?? '',
  })
  const { data: userEns } = useEnsName({ address: userAddress as Address })
  const userVeCrv = useStore((state) => state.user.userVeCrv)

  const isUserPowerStale = calculateUserPowerStale(
    +userVeCrv.veCrv,
    userGaugeWeightVotes?.powerUsed ?? 0,
    userGaugeWeightVotes?.veCrvUsed ?? 0,
  )

  return (
    <UserDataWrapper>
      <Box flex flexWrap="wrap" flexGap="var(--spacing-3)" flexJustifyContent="space-between">
        <MetricsComp
          loading={userGaugeWeightsLoading}
          title="User"
          data={
            <StyledInternalLink href={getEthPath(`${DAO_ROUTES.PAGE_USER}/${userAddress}`)}>
              <MetricsColumnData>{userEns ?? shortenAddress(userAddress)}</MetricsColumnData>
            </StyledInternalLink>
          }
        />
        <MetricsComp
          loading={userGaugeWeightsLoading}
          title="Power used"
          data={<MetricsColumnData>{userGaugeWeightVotes?.powerUsed}%</MetricsColumnData>}
        />
        <MetricsComp
          loading={userGaugeWeightsLoading}
          title="veCRV"
          data={<MetricsColumnData>{formatNumber(userVeCrv.veCrv)}</MetricsColumnData>}
        />
        <MetricsComp
          loading={userGaugeWeightsLoading}
          title="veCRV used"
          data={<MetricsColumnData>{formatNumber(userGaugeWeightVotes?.veCrvUsed)}</MetricsColumnData>}
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
