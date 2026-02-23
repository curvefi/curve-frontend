import { ReactNode } from 'react'
import { CampaignRewardsRow } from '@/dex/components/CampaignRewardsRow'
import { TCellRewards } from '@/dex/components/TableCellRewards'
import { TableCellRewardsOthers } from '@/dex/components/TableCellRewardsOthers'
import { ROUTE } from '@/dex/constants'
import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { getPath } from '@/dex/utils/utilsRouter'
import type { Chain } from '@curvefi/prices-api'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import type { ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { Metric, MetricProps } from '@ui-kit/shared/ui/Metric'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Address } from '@ui-kit/utils'
import { PoolColumnId } from '../columns'
import type { PoolListItem } from '../types'

const { Spacing } = SizesAndSpaces

const ListInfoItem = ({
  value,
  children,
  ...props
}: Omit<MetricProps, 'value'> & { value: number | string | undefined | null; children?: ReactNode }) => (
  <Grid size={6}>
    <Metric value={value && +value} {...props} />
    {children}
  </Grid>
)

const highlight = { color: 'success' as const }

export const PoolMobileExpandedPanel: ExpandedPanel<PoolListItem> = ({ row, table }) => {
  const { original: poolData } = row
  const {
    pool: { id: poolId, address },
    totalAPR,
    network,
  } = poolData
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: network as Chain,
    address: address as Address,
  })
  const path = getPath({ network }, `${ROUTE.PAGE_POOLS}/${poolId}`)
  const { volume, tvl, rewards: rewards } = poolData

  const { isCrvRewardsEnabled } = useNetworkFromUrl() ?? {}
  const hasVolume = table.getColumn(PoolColumnId.Volume)?.getIsVisible()
  return (
    <>
      <Grid container spacing={Spacing.md}>
        {hasVolume && (
          <ListInfoItem
            label={t`24h Volume`}
            value={volume?.value}
            valueOptions={{ unit: 'dollar', ...(isSortedBy(table, PoolColumnId.Volume) && highlight) }}
          />
        )}
        <ListInfoItem
          label={t`TVL`}
          value={tvl?.value}
          valueOptions={{ unit: 'dollar', ...(isSortedBy(table, PoolColumnId.Tvl) && highlight) }}
        />

        <ListInfoItem
          label={t`BASE vAPY`}
          value={rewards?.base?.day}
          valueOptions={{ unit: 'percentage', ...(isSortedBy(table, PoolColumnId.RewardsBase) && highlight) }}
        />

        {!poolData?.gauge.isKilled && (
          <>
            {isCrvRewardsEnabled ? (
              <ListInfoItem
                value={totalAPR}
                valueOptions={{
                  unit: 'percentage',
                  ...(isSortedBy(table, PoolColumnId.RewardsCrv) || isSortedBy(table, PoolColumnId.RewardsOther)
                    ? highlight
                    : {}),
                }}
                label={t`REWARDS tAPR`}
                labelTooltip={{ title: t`(CRV tAPR + Other tAPR)` }}
                valueTooltip={{
                  title: t`Token APR based on current prices of tokens and reward rates`,
                  body: (
                    <TCellRewards
                      poolData={poolData}
                      isHighlightBase={isSortedBy(table, PoolColumnId.RewardsBase)}
                      isHighlightCrv={isSortedBy(table, PoolColumnId.RewardsCrv)}
                      isHighlightOther={isSortedBy(table, PoolColumnId.RewardsOther)}
                      rewardsApy={rewards}
                    />
                  ),
                }}
              ></ListInfoItem>
            ) : (
              <ListInfoItem
                value={totalAPR}
                valueOptions={{ unit: 'percentage', ...(isSortedBy(table, PoolColumnId.RewardsOther) && highlight) }}
                valueTooltip={{
                  title: (
                    <TableCellRewardsOthers
                      isHighlight={isSortedBy(table, PoolColumnId.RewardsOther)}
                      rewardsApy={rewards}
                    />
                  ),
                }}
                label={t`REWARDS tAPR`}
                labelTooltip={{ title: t`Token APR based on current prices of tokens and reward rates` }}
              ></ListInfoItem>
            )}
            {campaigns.length > 0 && (
              <Stack direction="column" alignItems="center">
                <Typography variant="bodyXsRegular" color="textTertiary" alignSelf="start">
                  {t`Additional external rewards`}
                </Typography>

                <CampaignRewardsRow rewardItems={campaigns} mobile />
              </Stack>
            )}
          </>
        )}
      </Grid>

      <Stack display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={3} marginBlock={3}>
        <Button
          data-testid="pool-link-deposit"
          component={RouterLink}
          href={path + ROUTE.PAGE_SWAP}
        >{t`Deposit`}</Button>
        <Button
          data-testid="pool-link-withdraw"
          component={RouterLink}
          href={path + ROUTE.PAGE_POOL_WITHDRAW}
        >{t`Withdraw`}</Button>
        <Button
          data-testid="pool-link-swap"
          component={RouterLink}
          href={path + ROUTE.PAGE_POOL_DEPOSIT}
        >{t`Swap`}</Button>
      </Stack>
    </>
  )
}
