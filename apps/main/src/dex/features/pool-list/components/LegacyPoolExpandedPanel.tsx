import { ReactNode } from 'react'
import { CampaignRewardsRow } from '@/dex/components/CampaignRewardsRow'
import { TableCellRewardsOthers } from '@/dex/components/TableCellRewardsOthers'
import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import type { Chain } from '@curvefi/prices-api'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import type { ExpandedPanelComponent } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { Metric, MetricProps } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal } from '@ui-kit/utils'
import { PoolRewardsTooltipContent } from '../../../components/PoolRewardsTooltipContent'
import { LegacyPoolColumnId } from '../columns'
import type { LegacyPoolRow } from '../types'

const { Spacing } = SizesAndSpaces

const ListInfoItem = ({
  value,
  children,
  ...props
}: Omit<MetricProps, 'value' | 'category'> & { value: number | string | undefined | null; children?: ReactNode }) => (
  <Grid size={6}>
    <Metric category="dex.legacyPoolListMobileExpanded" value={decimal(value)} {...props} />
    {children}
  </Grid>
)

const highlight = { color: 'success' as const }

export const LegacyPoolExpandedPanel: ExpandedPanelComponent<LegacyPoolRow> = ({ row, table }) => {
  const { original: poolData } = row
  const {
    pool: { address },
    totalAPR,
    network,
  } = poolData
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: network as Chain,
    address: address as Address,
  })
  const { volume, tvl, rewards } = poolData

  const { isCrvRewardsEnabled } = useNetworkFromUrl() ?? {}
  const hasVolume = table.getColumn(LegacyPoolColumnId.Volume)?.getIsVisible()
  return (
    <Grid container spacing={Spacing.md}>
      {hasVolume && (
        <ListInfoItem
          label={t`24h Volume`}
          value={volume}
          valueOptions={{ unit: 'dollar', ...(isSortedBy(table, LegacyPoolColumnId.Volume) && highlight) }}
        />
      )}
      <ListInfoItem
        label={t`TVL`}
        value={tvl}
        valueOptions={{ unit: 'dollar', ...(isSortedBy(table, LegacyPoolColumnId.Tvl) && highlight) }}
      />

      <ListInfoItem
        label={t`BASE vAPY`}
        value={rewards?.base?.day}
        valueOptions={{ unit: 'percentage', ...(isSortedBy(table, LegacyPoolColumnId.RewardsBase) && highlight) }}
      />

      {!poolData?.gauge.isKilled && (
        <>
          {isCrvRewardsEnabled ? (
            <ListInfoItem
              value={totalAPR}
              valueOptions={{
                unit: 'percentage',
                ...(isSortedBy(table, LegacyPoolColumnId.RewardsCrv) ||
                isSortedBy(table, LegacyPoolColumnId.RewardsOther)
                  ? highlight
                  : {}),
              }}
              label={t`REWARDS tAPR`}
              labelTooltip={{ title: t`(CRV tAPR + Other tAPR)` }}
              valueTooltip={{
                title: t`Token APR based on current prices of tokens and reward rates`,
                body: (
                  <PoolRewardsTooltipContent
                    poolData={poolData}
                    isHighlightBase={isSortedBy(table, LegacyPoolColumnId.RewardsBase)}
                    isHighlightCrv={isSortedBy(table, LegacyPoolColumnId.RewardsCrv)}
                    isHighlightOther={isSortedBy(table, LegacyPoolColumnId.RewardsOther)}
                    rewardsApy={rewards}
                  />
                ),
              }}
            ></ListInfoItem>
          ) : (
            <ListInfoItem
              value={totalAPR}
              valueOptions={{
                unit: 'percentage',
                ...(isSortedBy(table, LegacyPoolColumnId.RewardsOther) && highlight),
              }}
              valueTooltip={{
                title: (
                  <TableCellRewardsOthers
                    isHighlight={isSortedBy(table, LegacyPoolColumnId.RewardsOther)}
                    rewardsApy={rewards}
                  />
                ),
              }}
              label={t`REWARDS tAPR`}
              labelTooltip={{ title: t`Token APR based on current prices of tokens and reward rates` }}
            ></ListInfoItem>
          )}
          {campaigns.length > 0 && (
            <Stack direction="column" sx={{ alignItems: 'center' }}>
              <Typography variant="bodyXsRegular" color="textTertiary" sx={{ alignSelf: 'start' }}>
                {t`Additional external rewards`}
              </Typography>

              <CampaignRewardsRow rewardItems={campaigns} mobile />
            </Stack>
          )}
        </>
      )}
    </Grid>
  )
}
