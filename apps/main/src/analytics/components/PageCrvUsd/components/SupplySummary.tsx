import type { CrvUsdYieldBasisSupply } from '@curvefi/prices-api/yield-basis'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { SupplySummaryTable } from './SupplySummaryTable'

const { Spacing } = SizesAndSpaces

export const SupplySummary = ({
  supply,
  scrvUsdSupply,
  loading,
}: {
  supply: CrvUsdYieldBasisSupply | undefined
  scrvUsdSupply: number | undefined
  loading: boolean
}) => (
  <Card size="small" sx={{ height: '100%' }}>
    <CardHeader title={t`Supply Breakdown`} />
    <CardContent sx={{ padding: 0, '&:last-child': { paddingBottom: 0 } }}>
      <Stack gap={Spacing.md}>
        <Box sx={{ paddingInline: Spacing.md, paddingBlockStart: Spacing.md }}>
          <Metric
            label={t`Total Supply`}
            value={supply?.totalSupply}
            loading={loading}
            valueOptions={{ unit: 'dollar' }}
            size="large"
          />
        </Box>
        <SupplySummaryTable supply={supply} scrvUsdSupply={scrvUsdSupply} loading={loading} />
      </Stack>
    </CardContent>
  </Card>
)
