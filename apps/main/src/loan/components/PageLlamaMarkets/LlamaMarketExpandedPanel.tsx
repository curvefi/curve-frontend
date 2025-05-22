import Link from 'next/link'
import { LineGraphCell } from '@/loan/components/PageLlamaMarkets/cells'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { FavoriteMarketButton } from '@/loan/components/PageLlamaMarkets/FavoriteMarketButton'
import { useUserMarketStats } from '@/loan/entities/llama-market-stats'
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
            <FavoriteMarketButton address={market.address} />
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
          decimals={2}
        />
      </ExpansionPanelSection>
      {market.userHasPosition && (
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
        href={market.url}
        color="ghost"
        data-testid="llama-market-go-to-market"
      >
        {t`Go To Market`}
      </Button>
    </>
  )
}
