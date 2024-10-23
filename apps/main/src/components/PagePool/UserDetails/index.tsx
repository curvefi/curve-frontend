import type { TransferProps } from '@/components/PagePool/types'

import { t } from '@lingui/macro'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import { getUserPoolActiveKey } from '@/store/createUserSlice'
import { shortenTokenAddress } from '@/utils'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'
import PoolRewardsCrv from '@/components/PoolRewardsCrv'
import Stats from '@/ui/Stats'
import Table from '@/ui/Table'

const MySharesStats = ({
  className,
  curve,
  poolData,
  poolDataCacheOrApi,
  routerParams,
  tokensMapper,
  userPoolBalances,
}: {
  className?: string
} & Pick<
  TransferProps,
  'curve' | 'poolData' | 'poolDataCacheOrApi' | 'routerParams' | 'tokensMapper' | 'userPoolBalances'
>) => {
  const { rChainId, rPoolId } = routerParams
  const userPoolActiveKey = curve && rPoolId ? getUserPoolActiveKey(curve, rPoolId) : ''
  const rewardsApy = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[rPoolId])
  const userCrvApy = useStore((state) => state.user.userCrvApy[userPoolActiveKey])
  const userLiquidityUsd = useStore((state) => state.user.userLiquidityUsd[userPoolActiveKey])
  const userShare = useStore((state) => state.user.userShare[userPoolActiveKey])
  const userWithdrawAmounts = useStore((state) => state.user.userWithdrawAmounts[userPoolActiveKey] ?? [])

  const haveBoosting = networks[rChainId].forms.indexOf('BOOSTING') !== -1
  const haveCrvRewards = rewardsApy?.crv?.[0] !== 0
  const { rewardsNeedNudging, areCrvRewardsStuckInBridge } = poolData?.gauge.status || {}

  const userShareLabel = useMemo(() => {
    if (userShare?.lpShare && Number(userShare.lpShare) !== 0) {
      if (Number(userShare.lpShare) > 0.01) {
        return formatNumber(userShare.lpShare, FORMAT_OPTIONS.PERCENT)
      }
      return `< ${formatNumber(0.01, FORMAT_OPTIONS.PERCENT)}`
    }
    return formatNumber(0, FORMAT_OPTIONS.PERCENT)
  }, [userShare])

  const withdrawTotal = useMemo(() => {
    if (poolDataCacheOrApi && !poolDataCacheOrApi.pool.isCrypto) {
      return userWithdrawAmounts.reduce((total, a) => {
        total += Number(a)
        return total
      }, 0)
    }
    return ''
  }, [poolDataCacheOrApi, userWithdrawAmounts])

  const crvRewardsTooltipText = useMemo(() => {
    if (haveBoosting && typeof rewardsApy?.crv?.[0] !== 'undefined' && userCrvApy?.boostApy && userCrvApy?.crvApy) {
      return (
        <CrvRewardsTooltipWrapper>
          <tbody>
            <tr>
              <td className="right">{formatNumber(rewardsApy.crv[0], FORMAT_OPTIONS.PERCENT)}</td>
              <td>&nbsp;({t`min. CRV tAPR %`})</td>
            </tr>
            <tr>
              <td className="right">x {formatNumber(userCrvApy.boostApy, FORMAT_OPTIONS.PERCENT)}</td>
              <td>&nbsp;({t`your boost`})</td>
            </tr>
            <tr>
              <td className="right">= {formatNumber(userCrvApy.crvApy, FORMAT_OPTIONS.PERCENT)}</td>
              <td>%</td>
            </tr>
          </tbody>
        </CrvRewardsTooltipWrapper>
      )
    }
    return ''
  }, [haveBoosting, rewardsApy?.crv, userCrvApy?.boostApy, userCrvApy?.crvApy])

  return (
    <MyStatsContainer className={className}>
      <Title>
        <h3>{t`Your position`}</h3>
        <span>
          {t`Staked share:`} <strong>{userShareLabel}</strong> <Chip size={'xs'}>{t`of pool`}</Chip>
        </span>
      </Title>

      <LPWrapper>
        <StyledStats label={t`LP Tokens`}>
          <div>
            {t`Staked:`} <strong>{formatNumber(userPoolBalances?.gauge, { defaultValue: '-' })}</strong>
          </div>
          <div>
            {t`Unstaked:`} <strong>{formatNumber(userPoolBalances?.lpToken, { defaultValue: '-' })}</strong>
          </div>
        </StyledStats>
        {(haveCrvRewards || haveBoosting) && (
          <div>
            {haveCrvRewards && (rewardsNeedNudging || areCrvRewardsStuckInBridge) ? (
              <Chip size="md">
                {t`Your CRV Rewards tAPR:`}{' '}
                <PoolRewardsCrv isHighlight={false} poolData={poolData} rewardsApy={rewardsApy} />
              </Chip>
            ) : (
              <Chip size="md" tooltip={crvRewardsTooltipText} tooltipProps={{ minWidth: '350px' }}>
                {t`Your CRV Rewards tAPR:`}{' '}
                {userCrvApy?.crvApy ? <strong>{formatNumber(userCrvApy.crvApy, FORMAT_OPTIONS.PERCENT)}</strong> : '-'}
              </Chip>
            )}
            {haveBoosting && (
              <>
                <br />
                <Chip size="md">
                  {t`Current Boost:`}{' '}
                  {userCrvApy?.boostApy ? (
                    <strong>{formatNumber(userCrvApy.boostApy, { maximumFractionDigits: 3 })}x</strong>
                  ) : (
                    '-'
                  )}
                </Chip>
                {/* TODO: future boost */}
              </>
            )}
          </div>
        )}
      </LPWrapper>

      <ContentWrapper>
        <TokensBalanceWrapper>
          <Chip size="md">{t`Balanced withdraw amounts`}</Chip>
          {Array.isArray(poolDataCacheOrApi.tokenAddresses) &&
            poolData?.tokenAddresses.map((address, idx) => {
              const token = poolData.tokens[idx]
              const tokenObj = tokensMapper[address]

              return (
                <Stats
                  isOneLine
                  isBorderBottom
                  key={address}
                  label={
                    tokenObj && poolData.tokensCountBy[token] > 1 ? (
                      <span>
                        {token} <Chip>{shortenTokenAddress(tokenObj.address)}</Chip>
                      </span>
                    ) : (
                      token
                    )
                  }
                >
                  <Chip as="strong" size="md" fontVariantNumeric="tabular-nums">
                    {formatNumber(userWithdrawAmounts[idx], { defaultValue: '-' })}
                  </Chip>
                </Stats>
              )
            })}

          {!poolDataCacheOrApi.pool.isCrypto && (
            <Stats isOneLine isBorderBottom label={`${poolDataCacheOrApi.tokens.join('+')}`}>
              <Chip as="strong" size="md" fontVariantNumeric="tabular-nums">
                {formatNumber(withdrawTotal)}
              </Chip>
            </Stats>
          )}
          <Stats isOneLine label={t`USD balance`}>
            <Chip as="strong" size="md" fontVariantNumeric="tabular-nums">
              {formatNumber(userLiquidityUsd, { ...FORMAT_OPTIONS.USD, defaultValue: '-' })}
            </Chip>
          </Stats>
        </TokensBalanceWrapper>
      </ContentWrapper>
    </MyStatsContainer>
  )
}

const StyledStats = styled(Stats)`
  margin: 0;
`

const LPWrapper = styled.div`
  align-items: flex-start;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  margin: 1rem;
  margin-bottom: 0.5rem;
`

const TokensBalanceWrapper = styled.div`
  margin: 1rem;
`

const ContentWrapper = styled.div`
  padding-top: 0;
  display: grid;
  grid-column-gap: var(--spacing-3);
`

const Title = styled(Box)`
  padding: 1rem;
  grid-template-columns: 1fr auto;

  .stats {
    margin: 0;
  }
`

const MyStatsContainer = styled(Box)`
  position: relative;
  width: 100%;
  background-color: var(--box--secondary--background-color);
`

const CrvRewardsTooltipWrapper = styled(Table)`
  tr:last-of-type {
    border-top: 1px solid var(--tooltip--border-color);
  }
  td {
    padding: 0.25rem 0;
  }
`

export default MySharesStats
