import { useEffect } from 'react'
import { CurrencyReserves } from '@/dex/components/PagePool/PoolDetails/CurrencyReserves'
import { PoolParameters } from '@/dex/components/PagePool/PoolDetails/PoolStats/PoolParameters'
import { Rewards as RewardsComp } from '@/dex/components/PagePool/PoolDetails/PoolStats/Rewards'
import type { PageTransferProps } from '@/dex/components/PagePool/types'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useTokenAlert } from '@/dex/hooks/useTokenAlert'
import { useStore } from '@/dex/store/useStore'
import { PoolAlert, TokensMapper, type UrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { AlertBox } from '@ui/AlertBox'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { InlineLink } from '@ui-kit/shared/ui/InlineLink'
import { cardContentSmallStyles } from '@ui-kit/themes/components/card-content'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type PoolStatsProps = {
  poolAlert: PoolAlert | null
  tokensMapper: TokensMapper
} & Pick<PageTransferProps, 'poolData' | 'poolDataCacheOrApi' | 'routerParams'>

export const PoolStats = ({ routerParams, poolAlert, poolData, poolDataCacheOrApi, tokensMapper }: PoolStatsProps) => {
  const tokenAlert = useTokenAlert(poolData?.tokenAddressesAll ?? [])
  const { rChainId: chainId, rPoolIdOrAddress: poolIdOrAddress } = routerParams
  const poolId = usePoolIdByAddressOrId({ chainId, poolIdOrAddress })
  const rewardsApy = useStore(state => state.pools.rewardsApyMapper[chainId]?.[poolId ?? ''])

  const { curveApi } = useCurve()
  const fetchPoolStats = useStore(state => state.pools.fetchPoolStats)

  const risksPathname = getPath(useParams<UrlParams>(), `/disclaimer`)

  // This loads various pool stats in the zustand store, like currency reserves.
  // If you remove this, all forms will be disabled as important data will be missing.
  // We can remove this once everything inside the function has been converted to queries.
  useEffect(() => {
    if (curveApi && poolData) {
      void fetchPoolStats(curveApi, poolData)
    }
  }, [curveApi, fetchPoolStats, poolData])

  return (
    <Card size="inline">
      <CardContent component={Grid} container columnSpacing={Spacing.md}>
        <Grid size={{ mobile: 12, desktop: 8 }} sx={cardContentSmallStyles}>
          <Stack sx={{ gap: Spacing.md }}>
            <CurrencyReserves chainId={chainId} poolId={poolId ?? ''} tokensMapper={tokensMapper} />

            {poolData && <RewardsComp chainId={chainId} poolData={poolData} rewardsApy={rewardsApy} />}

            <Stack sx={{ gap: Spacing.sm }}>
              {poolAlert && !poolAlert.isDisableDeposit && !poolAlert.isInformationOnlyAndShowInForm && (
                <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>
              )}
              {tokenAlert && tokenAlert.isInformationOnly && <AlertBox {...tokenAlert}>{tokenAlert.message}</AlertBox>}

              {poolDataCacheOrApi.pool.referenceAsset === 'CRYPTO' && (
                <AlertBox alertType="info" title={t`${poolDataCacheOrApi.pool.name} is a Cryptoswap pool`}>
                  {t`Cryptoswap pools contain non pegged assets. Liquidity providers are exposed to all assets in the pools.`}{' '}
                  <InlineLink to="https://docs.curve.finance/user/dex/overview" external hideIcon>
                    {t`Click here to learn more about Cryptoswap pools`}
                  </InlineLink>
                </AlertBox>
              )}
              <AlertBox alertType="info" flexAlignItems="center">
                <InlineLink to={risksPathname} external hideIcon>
                  {t`Risks of using ${poolDataCacheOrApi.pool.name}`}
                </InlineLink>
              </AlertBox>
            </Stack>
          </Stack>
        </Grid>

        <Grid
          size={{ mobile: 12, desktop: 4 }}
          sx={{
            ...cardContentSmallStyles,
            backgroundColor: t => t.design.Layer[2].Fill,
            border: t => `1px solid ${t.design.Layer[2].Outline}`,
          }}
        >
          <PoolParameters poolData={poolData} poolDataCacheOrApi={poolDataCacheOrApi} routerParams={routerParams} />
        </Grid>
      </CardContent>
    </Card>
  )
}
