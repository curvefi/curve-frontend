import Link from 'next/link'
import { LineGraphCell } from '@/loan/components/PageLlamaMarkets/cells'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { FavoriteMarketButton } from '@/loan/components/PageLlamaMarkets/FavoriteMarketButton'
import { useUserMarketStats } from '@/loan/entities/llama-market-stats'
import { ArrowRight } from '@carbon/icons-react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'
import { ExpansionPanelSection } from '@ui-kit/shared/ui/DataTable/ExpansionPanelSection'
import { type ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { Metric } from '@ui-kit/shared/ui/Metric'
import type { LlamaMarket } from '../../entities/llama-markets'

export const LlamaMarketExpandedPanel: ExpandedPanel<LlamaMarket> = ({ row: { original: market } }) => {
  const { data: earnings, error: earningsError } = useUserMarketStats(market, LlamaMarketColumnId.UserEarnings)
  const { data: deposited, error: depositedError } = useUserMarketStats(market, LlamaMarketColumnId.UserDeposited)
  const { leverage, utilizationPercent, liquidityUsd, userHasPosition, url, address, rates } = market
  return (
    <>
      <ExpansionPanelSection
        title={
          <Stack direction="row" gap={2} justifyContent="space-between">
            {t`Market Details`}
            <Stack direction="row">
              <CopyIconButton
                label={t`Copy market address`}
                copyText={address}
                confirmationText={t`Market address copied`}
                data-testid={`copy-market-address-${address}`}
              />
              <FavoriteMarketButton address={address} />
            </Stack>
          </Stack>
        }
      >
        <Metric label={t`7D Avg Borrow Rate`} value={rates.borrow} unit="percentage" />
        <LineGraphCell market={market} type="borrow" />
        <Metric label={t`Available Liquidity`} value={liquidityUsd} unit="dollar" />
        <Metric
          label={t`Utilization`}
          value={utilizationPercent}
          unit="percentage"
          testId="metric-utilizationPercent"
          decimals={2}
        />
        {leverage > 0 && <Metric label={t`Leverage 🔥`} value={leverage} unit="multiplier" />}
      </ExpansionPanelSection>
      {userHasPosition && (
        <ExpansionPanelSection title={t`Your Position`}>
          {earnings?.earnings != null && <Metric label={t`Earnings`} value={earnings.earnings} unit="dollar" />}
          {deposited?.deposited != null && (
            <Metric label={t`Supplied Amount`} value={deposited.deposited} unit="dollar" />
          )}
        </ExpansionPanelSection>
      )}
      <Button
        sx={{ flexGrow: 1, borderBlock: (t) => `1px solid ${t.design.Layer[1].Outline}` }}
        component={Link}
        href={url}
        color="ghost"
        data-testid="llama-market-go-to-market"
        endIcon={<ArrowRight />}
      >
        {t`Go To Market`}
      </Button>
    </>
  )
}
