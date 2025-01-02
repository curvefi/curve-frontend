import Grid from '@mui/material/Grid2'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ColumnFiltersState } from '@tanstack/react-table'
import { Dispatch, Fragment, SetStateAction } from 'react'
import { LendingVault } from '@/entities/vaults'
import { capitalize } from 'lodash'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import Typography from '@mui/material/Typography'
import { t } from '@lingui/macro'
import { MultiSelectFilter } from '@/components/PageLlamaMarkets/filters/MultiSelectFilter'

const { Spacing } = SizesAndSpaces

export const LendingMarketsFilters = ({
  ...props
}: {
  columnFilters: ColumnFiltersState
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>
  data: LendingVault[]
}) => (
  <Grid container spacing={Spacing.md}>
    <Grid size={{ mobile: 12, tablet: 6, desktop: 3 }}>
      <MultiSelectFilter
        id="blockchainId"
        renderItem={(blockchainId) => (
          <>
            <ChainIcon blockchainId={blockchainId} size="sm" />
            <Typography component="span" sx={{ marginInlineStart: 2 }}>
              {capitalize(blockchainId)}
            </Typography>
          </>
        )}
        defaultText={t`All Chains`}
        {...props}
      />
    </Grid>

    {/*<Grid size={{ mobile: 12, tablet: 6, desktop: 3 }}>*/}
    {/*  <MultiSelectFilter*/}
    {/*    id="assets.collateral.symbol"*/}
    {/*    renderItem={(asset) => (*/}
    {/*      <>*/}
    {/*        /!*<TokenIcon asset={asset} size="sm" />*!/*/}
    {/*        <Typography component="span" sx={{ marginInlineStart: 2 }}>*/}
    {/*          {asset}*/}
    {/*        </Typography>*/}
    {/*      </>*/}
    {/*    )}*/}
    {/*    defaultText={t`All Collateral Tokens`}*/}
    {/*    {...props}*/}
    {/*  />*/}
    {/*</Grid>*/}

    {/*<Grid size={{ mobile: 12, tablet: 6, desktop: 3 }}>All Debt Tokens</Grid>*/}

    {/*<Grid size={{ mobile: 12, tablet: 6, desktop: 3 }}>Market Age</Grid>*/}

    {/*<Grid size={{ mobile: 12, tablet: 12, desktop: 6 }}>Min Liquidity: $10.00k</Grid>*/}

    {/*<Grid size={{ mobile: 12, tablet: 12, desktop: 6 }}>Min Utilization: $100.00k</Grid>*/}
  </Grid>
)
