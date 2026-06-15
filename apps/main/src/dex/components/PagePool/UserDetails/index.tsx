import { useMemo } from 'react'
import { styled } from 'styled-components'
import { useConnection } from 'wagmi'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { PoolRewardsCrv } from '@/dex/components/PoolRewardsCrv'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { useUserPoolInfo } from '@/dex/hooks/useUserPoolInfo'
import { useStore } from '@/dex/store/useStore'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Box } from '@ui/Box'
import { Stats } from '@ui/Stats'
import { Table } from '@ui/Table'
import { Chip } from '@ui/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { shortenAddress, formatNumber, amount } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const DEFAULT_WITHDRAW_AMOUNTS: string[] = []

export const MySharesStats = ({
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
  const rewardsApy = useStore(state => state.pools.rewardsApyMapper[rChainId]?.[poolId ?? ''])

  const { data: userPoolInfo, error: userPoolError } = useUserPoolInfo({
    chainId: rChainId,
    poolId,
    userAddress: curve?.signerAddress,
  })

  const userWithdrawAmounts = userPoolInfo?.userWithdrawAmounts ?? DEFAULT_WITHDRAW_AMOUNTS
  const userLpShare = userPoolInfo?.userShare?.lpShare
  const userBoostApy = userPoolInfo?.userCrvApy.boostApy
  const userCrvApyValue = userPoolInfo?.userCrvApy.crvApy

  const haveBoosting = rChainId === 1
  const crvRewards = rewardsApy?.crv
  const haveCrvRewards = crvRewards?.[0] !== 0
  const { rewardsNeedNudging, areCrvRewardsStuckInBridge } = poolData?.gauge.status ?? {}

  const userShareLabel = useMemo(() => {
    if (userLpShare && Number(userLpShare)) {
      if (Number(userLpShare) > 0.01) {
        return formatNumber(amount(userLpShare), 'percent.value')
      }
      return `< ${formatNumber(0.01, 'percent.value')}`
    }
    return formatNumber(0, 'percent.value')
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
              <td className="right">{formatNumber(crvRewards[0], 'percent.value')}</td>
              <td>&nbsp;({t`min. CRV tAPR %`})</td>
            </tr>
            <tr>
              <td className="right">x {formatNumber(amount(userBoostApy), 'percent.value')}</td>
              <td>&nbsp;({t`your boost`})</td>
            </tr>
            <tr>
              <td className="right">= {formatNumber(userCrvApyValue, 'percent.value')}</td>
              <td>%</td>
            </tr>
          </tbody>
        </CrvRewardsTooltipWrapper>
      )
    }
    return ''
  }, [haveBoosting, crvRewards, userBoostApy, userCrvApyValue])

  return (
    <Card size="small">
      <CardContent>
        <Stack sx={{ gap: Spacing.md }}>
          <Stack sx={{ gap: Spacing.xs }}>
            <Typography variant="headingSBold">{t`Your position`}</Typography>
            <Typography variant="bodySRegular">
              <span>
                {t`Staked share:`} <strong>{userShareLabel}</strong> <Chip size="xs">{t`of pool`}</Chip>
                {userPoolError && (
                  <Tooltip title={userPoolError.message} placement="top">
                    <ExclamationTriangleIcon fontSize="small" color="error" />
                  </Tooltip>
                )}
              </span>
            </Typography>
          </Stack>

          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)">
            <Stats label={t`LP Tokens`}>
              <div>
                {t`Staked:`} <strong>{formatNumber(gaugeTokenBalance, { abbreviate: false, fallback: '-' })}</strong>
              </div>
              <div>
                {t`Unstaked:`} <strong>{formatNumber(lpTokenBalance, { abbreviate: false, fallback: '-' })}</strong>
              </div>
            </Stats>
            {(haveCrvRewards || haveBoosting) && (
              <div>
                {haveCrvRewards && (rewardsNeedNudging || areCrvRewardsStuckInBridge) ? (
                  <Chip size="md">
                    {t`Your CRV Rewards tAPR:`}{' '}
                    <PoolRewardsCrv isHighlight={false} poolData={poolData} rewardsApy={rewardsApy} />
                  </Chip>
                ) : (
                  <Chip size="md" tooltip={crvRewardsTooltipText} tooltipProps={{ minWidth: '350px' }}>
                    {t`Your CRV Rewards tAPR:`} <strong>{formatNumber(userCrvApyValue, 'percent.value')}</strong>
                  </Chip>
                )}
                {haveBoosting && (
                  <>
                    <br />
                    <Chip size="md">
                      {t`Current Boost:`}{' '}
                      <strong>
                        {formatNumber(amount(userBoostApy), {
                          maximumFractionDigits: 3,
                          abbreviate: false,
                          fallback: '-',
                        })}
                        x
                      </strong>
                    </Chip>
                    {/* TODO: future boost */}
                  </>
                )}
              </div>
            )}
          </Box>

          <Stack>
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
                      {formatNumber(amount(userWithdrawAmounts[idx]), { abbreviate: false, fallback: '-' })}
                    </Chip>
                  </Stats>
                )
              })}

            {!poolDataCacheOrApi.pool.isCrypto && (
              <Stats isOneLine isBorderBottom label={`${poolDataCacheOrApi.tokens.join('+')}`}>
                <Chip as="strong" size="md" fontVariantNumeric="tabular-nums">
                  {formatNumber(amount(withdrawTotal), { abbreviate: false, fallback: '-' })}
                </Chip>
              </Stats>
            )}
            <Stats isOneLine label={t`USD balance`}>
              <Chip as="strong" size="md" fontVariantNumeric="tabular-nums">
                {formatNumber(amount(userPoolInfo?.userLiquidityUsd), {
                  unit: 'dollar',
                  abbreviate: false,
                  fallback: '-',
                })}
              </Chip>
            </Stats>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

const CrvRewardsTooltipWrapper = styled(Table)`
  tr:last-of-type {
    border-top: 1px solid var(--tooltip--border-color);
  }
  td {
    padding: 0.25rem 0;
  }
`
