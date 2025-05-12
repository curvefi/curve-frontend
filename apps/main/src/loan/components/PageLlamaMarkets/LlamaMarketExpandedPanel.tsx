import Link from 'next/link'
import { LineGraphCell } from '@/loan/components/PageLlamaMarkets/cells'
import Button from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { type ExpandedPanel, ExpansionPanelSection } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { Metric } from '@ui-kit/shared/ui/Metric'
import type { LlamaMarket } from '../../entities/llama-markets'

export const LlamaMarketExpandedPanel: ExpandedPanel<LlamaMarket> = ({ row: { original: market } }) => (
  <>
    <ExpansionPanelSection title={t`Market Details`}>
      <Metric label={t`7D Avg Borrow Rate`} value={market.rates.borrow} unit="percentage" />
      <LineGraphCell market={market} type="borrow" />
      {market.rates.lend && (
        <>
          <Metric label={t`7D Avg Supply Rate`} value={market.rates.lend} unit="percentage" />
          <LineGraphCell market={market} type="lend" />
        </>
      )}
      <Metric label={t`Available Liquidity`} value={market.liquidityUsd} unit="dollar" />
      <Metric label={t`Utilization`} value={market.utilizationPercent} unit="percentage" />
    </ExpansionPanelSection>
    {market.userHasPosition && (
      //  todo: get the data
      <ExpansionPanelSection title={t`Your Position`}>
        <Metric label={t`Earnings`} value={0} unit="percentage" />
        <Metric label={t`Supplied Amount`} value={0} unit="percentage" />
      </ExpansionPanelSection>
    )}
    <Button sx={{ flexGrow: 1 }} component={Link} href={market.url} color="navigation">
      {t`Go To Market`}
    </Button>
  </>
)
