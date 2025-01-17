import Grid from '@mui/material/Grid2'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import React, { useMemo } from 'react'
import { LendingVault } from '@loan/entities/vaults'
import { capitalize } from 'lodash'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import Typography from '@mui/material/Typography'
import { t } from '@lingui/macro'
import { MultiSelectFilter } from '@loan/components/PageLlamaMarkets/filters/MultiSelectFilter'
import { formatNumber, getImageBaseUrl } from '@ui/utils'
import TokenIcon from '../TokenIcon'
import { MinimumSliderFilter } from '@loan/components/PageLlamaMarkets/filters/MinimumSliderFilter'

const { Spacing } = SizesAndSpaces

/**
 * Displays a token with its icon and symbol.
 * This is used in the lending markets filters to display collateral and debt tokens.
 */
const Token = ({ symbol, data, field }: { symbol: string; data: LendingVault[]; field: 'collateral' | 'borrowed' }) => {
  const { blockchainId, address } = useMemo(
    () => data.find((d) => d.assets[field].symbol === symbol)!.assets[field],
    [data, field, symbol],
  )
  return (
    <>
      <TokenIcon imageBaseUrl={getImageBaseUrl(blockchainId)} token={symbol} address={address} size="mui-md" />
      <Typography component="span" variant="bodyMBold">
        {symbol}
      </Typography>
    </>
  )
}

/**
 * Filters for the lending markets table. Includes filters for chain, collateral token, debt token, liquidity, and utilization.
 */
export const LendingMarketsFilters = ({
  ...props
}: {
  columnFilters: Record<string, unknown>
  setColumnFilter: (id: string, value: unknown) => void
  data: LendingVault[]
}) => (
  <Grid container spacing={Spacing.sm} paddingTop={Spacing.sm}>
    <Grid size={{ mobile: 12, tablet: 4 }}>
      <MultiSelectFilter
        field="blockchainId"
        renderItem={(blockchainId) => (
          <>
            <ChainIcon blockchainId={blockchainId} size="md" />
            <Typography component="span" variant="bodyMBold">
              {capitalize(blockchainId)}
            </Typography>
          </>
        )}
        defaultText={t`All Chains`}
        {...props}
      />
    </Grid>

    <Grid size={{ mobile: 12, tablet: 4 }}>
      <MultiSelectFilter
        field="assets.collateral.symbol"
        renderItem={(symbol) => <Token symbol={symbol} data={props.data} field="collateral" />}
        defaultText={t`All Collateral Tokens`}
        {...props}
      />
    </Grid>

    <Grid size={{ mobile: 12, tablet: 4 }}>
      <MultiSelectFilter
        field="assets.borrowed.symbol"
        renderItem={(symbol) => <Token symbol={symbol} data={props.data} field="borrowed" />}
        defaultText={t`All Debt Tokens`}
        {...props}
      />
    </Grid>

    <Grid size={{ mobile: 12, tablet: 6 }}>
      <MinimumSliderFilter
        field="totalSupplied.usdTotal"
        title={t`Min Liquidity`}
        format={(value) => formatNumber(value, { currency: 'USD' })}
        {...props}
      />
    </Grid>

    <Grid size={{ mobile: 12, tablet: 6 }}>
      <MinimumSliderFilter
        field="utilizationPercent"
        title={t`Min Utilization`}
        format={(value) => value.toFixed(2) + '%'}
        {...props}
      />
    </Grid>
  </Grid>
)
