import React from 'react'
import styled from 'styled-components'

import { usePoolContext } from '@/components/PagePool/contextPool'
import { userSignerPoolDetails } from '@/entities/signer'
import networks from '@/networks'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import DetailsCrvApr from '@/components/PagePool/UserDetails/components/DetailsCrvApr'
import DetailsBoostApy from '@/components/PagePool/UserDetails/components/DetailsBoostApy'
import DetailsStaked from '@/components/PagePool/UserDetails/components/DetailsStaked'
import DetailsStakedShare from '@/components/PagePool/UserDetails/components/DetailsStakedShare'
import DetailsWithdrawBalancedAmounts from '@/components/PagePool/UserDetails/components/DetailsWithdrawBalancedAmounts'

type Props = {
  className?: string
}

const MySharesStats: React.FC<Props> = ({ className = '' }) => {
  const { rChainId, rPoolId, poolBaseSignerKeys, signerPoolBalances } = usePoolContext()

  const { gauge: gaugeBalance, lpToken: lpTokenBalance } = signerPoolBalances ?? {}

  const { data: signerPoolDetails } = userSignerPoolDetails({ ...poolBaseSignerKeys, gaugeBalance, lpTokenBalance })

  const rewardsApy = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[rPoolId])

  const { userShare, crvApy, boostApy, liquidityUsd, lpTokenBalances } = signerPoolDetails ?? {}

  const haveBoosting = networks[rChainId].forms.indexOf('BOOSTING') !== -1
  const haveCrvRewards = Number(rewardsApy?.crv?.[0]) > 0

  return (
    <MyStatsContainer className={className}>
      <DetailsStakedShare lpShare={userShare?.lpShare} />

      <LPWrapper>
        <DetailsStaked lpToken={lpTokenBalances?.lpToken} gauge={lpTokenBalances?.gauge} />
        {(haveCrvRewards || haveBoosting) && (
          <div>
            <DetailsCrvApr userCrvApy={crvApy} userBoostApy={boostApy} />
            <DetailsBoostApy userBoostApy={boostApy} />
          </div>
        )}
      </LPWrapper>

      <ContentWrapper>
        <DetailsWithdrawBalancedAmounts userLiquidityUsd={liquidityUsd} lpUser={userShare?.lpShare} />
      </ContentWrapper>
    </MyStatsContainer>
  )
}

const LPWrapper = styled.div`
  align-items: flex-start;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  margin: 1rem;
  margin-bottom: 0.5rem;
`

const ContentWrapper = styled.div`
  padding-top: 0;
  display: grid;
  grid-column-gap: var(--spacing-3);
`

const MyStatsContainer = styled(Box)`
  position: relative;
  width: 100%;
  background-color: var(--box--secondary--background-color);
`

export default MySharesStats
