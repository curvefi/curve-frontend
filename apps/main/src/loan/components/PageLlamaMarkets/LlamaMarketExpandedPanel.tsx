import Link from 'next/link'
import { LineGraphCell } from '@/loan/components/PageLlamaMarkets/cells'
import { useFavoriteMarket } from '@/loan/entities/favorite-markets'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { t } from '@ui-kit/lib/i18n'
import { FavoriteHeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'
import { ExpansionPanelSection } from '@ui-kit/shared/ui/DataTable/ExpansionPanelSection'
import { type ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import type { LlamaMarket } from '../../entities/llama-markets'

export const LlamaMarketExpandedPanel: ExpandedPanel<LlamaMarket> = ({ row: { original: market } }) => {
  const [isFavorite, toggleFavorite] = useFavoriteMarket(market.address)
  return (
    <>
      <ExpansionPanelSection
        title={
          <Stack direction="row" gap={2}>
            {t`Market Details`}
            <CopyIconButton
              label={t`Copy market address`}
              copyText={market.address}
              confirmationText={t`Market address copied`}
              data-testid={`copy-market-address-${market.address}`}
            />
            <Tooltip title={isFavorite ? t`Remove from favorites` : t`Add to favorites`} placement="top">
              <IconButton size="extraSmall" onClick={toggleFavorite}>
                <FavoriteHeartIcon color={useTheme().design.Text.TextColors.Highlight} isFavorite={isFavorite} />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      >
        <Metric label={t`7D Avg Borrow Rate`} value={market.rates.borrow} unit="percentage" />
        <LineGraphCell market={market} type="borrow" />
        {market.rates.lend && (
          <>
            <Metric label={t`7D Avg Supply Rate`} value={market.rates.lend} unit="percentage" />
            <LineGraphCell market={market} type="lend" />
          </>
        )}
        <Metric label={t`Available Liquidity`} value={market.liquidityUsd} unit="dollar" />
        <Metric
          label={t`Utilization`}
          value={market.utilizationPercent}
          unit="percentage"
          testId="metric-utilizationPercent"
        />
      </ExpansionPanelSection>
      {market.userHasPosition && (
        //  todo: get the data
        <ExpansionPanelSection title={t`Your Position`}>
          <Metric label={t`Earnings`} value={0} unit="percentage" />
          <Metric label={t`Supplied Amount`} value={0} unit="percentage" />
        </ExpansionPanelSection>
      )}
      <Button
        sx={{ flexGrow: 1, borderBlock: (t) => `1px solid ${t.design.Layer[1].Outline}` }}
        component={Link}
        href={market.url}
        color="ghost"
      >
        {t`Go To Market`}
      </Button>
    </>
  )
}
