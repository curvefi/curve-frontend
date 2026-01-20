import { useMemo } from 'react'
import { styled } from 'styled-components'
import { useConnection } from 'wagmi'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { PoolRewardsCrv } from '@/dex/components/PoolRewardsCrv'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { useUserPoolInfo } from '@/dex/queries/user-pool-info.query'
import { useStore } from '@/dex/store/useStore'
import { Box } from '@ui/Box'
import { Stats } from '@ui/Stats'
import { Table } from '@ui/Table'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { shortenAddress, type Address } from '@ui-kit/utils'

const DEFAULT_WITHDRAW_AMOUNTS: string[] = []

export const MySharesStats = ({
  className,
  curve,
  poolData,
  poolDataCacheOrApi,
  routerParams,
  tokensMapper,
}: {
  className?: string
} & Pick<TransferProps, 'curve' | 'poolData' | 'poolDataCacheOrApi' | 'routerParams' | 'tokensMapper'>) => {
  const { rChainId, rPoolIdOrAddress } = routerParams
  const poolId = usePoolIdByAddressOrId({ chainId: rChainId, poolIdOrAddress: rPoolIdOrAddress })
  const rewardsApy = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[poolId ?? ''])

  const { data: userPoolInfo } = useUserPoolInfo(
    { chainId: rChainId, poolId, userAddress: curve?.signerAddress as Address | undefined },
    !!curve && !!poolId,
  )

  const userWithdrawAmounts = userPoolInfo?.userWithdrawAmounts ?? DEFAULT_WITHDRAW_AMOUNTS
  const userLpShare = userPoolInfo?.userShare?.lpShare
  const userBoostApy = userPoolInfo?.userCrvApy.boostApy
  const userCrvApyValue = userPoolInfo?.userCrvApy.crvApy

  const haveBoosting = rChainId === 1
  const crvRewards = rewardsApy?.crv
  const haveCrvRewards = crvRewards?.[0] !== 0
  const { rewardsNeedNudging, areCrvRewardsStuckInBridge } = poolData?.gauge.status || {}

  const userShareLabel = useMemo(() => {
    if (userLpShare && Number(userLpShare)) {
      if (Number(userLpShare) > 0.01) {
        return formatNumber(userLpShare, FORMAT_OPTIONS.PERCENT)
      }
      return `< ${formatNumber(0.01, FORMAT_OPTIONS.PERCENT)}`
    }
    return formatNumber(0, FORMAT_OPTIONS.PERCENT)
  }, [userLpShare])

  const withdrawTotal = useMemo(() => {
    if (poolDataCacheOrApi && !poolDataCacheOrApi.pool.isCrypto) {
      return userWithdrawAmounts.reduce((total, a) => {
        total += Number(a)
        return total
      }, 0)
    }
    return ''
  }, [poolDataCacheOrApi, userWithdrawAmounts])

  const { address: userAddress } = useConnection()
  const { lpTokenBalance, gaugeTokenBalance } = usePoolTokenDepositBalances({
    chainId: rChainId,
    userAddress,
    poolId,
  })

  const crvRewardsTooltipText = useMemo(() => {
    if (haveBoosting && typeof crvRewards?.[0] !== 'undefined' && userBoostApy && userCrvApyValue) {
      return (
        <CrvRewardsTooltipWrapper>
          <tbody>
            <tr>
              <td className="right">{formatNumber(crvRewards[0], FORMAT_OPTIONS.PERCENT)}</td>
              <td>&nbsp;({t`min. CRV tAPR %`})</td>
            </tr>
            <tr>
              <td className="right">x {formatNumber(userBoostApy, FORMAT_OPTIONS.PERCENT)}</td>
              <td>&nbsp;({t`your boost`})</td>
            </tr>
            <tr>
              <td className="right">= {formatNumber(userCrvApyValue, FORMAT_OPTIONS.PERCENT)}</td>
              <td>%</td>
            </tr>
          </tbody>
        </CrvRewardsTooltipWrapper>
      )
    }
    return ''
  }, [haveBoosting, crvRewards, userBoostApy, userCrvApyValue])

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
            {t`Staked:`} <strong>{formatNumber(gaugeTokenBalance, { defaultValue: '-' })}</strong>
          </div>
          <div>
            {t`Unstaked:`} <strong>{formatNumber(lpTokenBalance, { defaultValue: '-' })}</strong>
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
                {userCrvApyValue ? <strong>{formatNumber(userCrvApyValue, FORMAT_OPTIONS.PERCENT)}</strong> : '-'}
              </Chip>
            )}
            {haveBoosting && (
              <>
                <br />
                <Chip size="md">
                  {t`Current Boost:`}{' '}
                  {userBoostApy ? <strong>{formatNumber(userBoostApy, { maximumFractionDigits: 3 })}x</strong> : '-'}
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
                        {token} <Chip>{shortenAddress(tokenObj.address)}</Chip>
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
              {formatNumber(userPoolInfo?.userLiquidityUsd, { ...FORMAT_OPTIONS.USD, defaultValue: '-' })}
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
