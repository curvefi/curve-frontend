import Box from '@mui/material/Box'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import LlamaSunglasses from '../../../../public/images/llama-sunglasses.png'
import Image from 'next/image'
import { t } from '@lingui/macro'
import Typography from '@mui/material/Typography'
import { InvertTheme } from '@ui-kit/shared/ui/ThemeProvider'

// size is hardcoded in the figma design
const Img = <Image src={LlamaSunglasses} alt="Llama with sunglasses" width={339} height={276} priority={false} />

const { MinWidth, MaxWidth, Spacing } = SizesAndSpaces

export const LendTableTitle = () => (
  <Box minWidth={MinWidth.tableHeader} sx={(t) => ({ backgroundColor: t.design.Layer[3].Fill })}>
    <Box maxWidth={MaxWidth.tableTitle} paddingBlock={Spacing.lg} display="flex" gap={Spacing.sm} marginInline="auto">
      {Img}
      <Box display="flex" flexDirection="column" gap={Spacing.sm} flexGrow={1}>
        <InvertTheme>
          <Box padding={Spacing.lg} sx={(t) => ({ backgroundColor: t.design.Layer.Highlight.Fill })}>
            <Typography color="text.primary" variant="headingXxl">{t`LLAMALEND`}</Typography>
            <Typography
              color="text.secondary"
              variant="bodyMBold"
            >{t`Stress - Free Borrowing in volatile markets`}</Typography>
          </Box>
        </InvertTheme>
        <Box display="flex" flexDirection="row" gap={Spacing.md} flexGrow={1}>
          <Section title={t`Stress Free`}>{t`Navigate high volatility calmly with Soft Liquidation.`}</Section>
          <Section title={t`More Savings`}>{t`Lower fees mean you save more money.`}</Section>
          <Section title={t`Risk Management`}>{t`Manage risks effectively with controlled lending options.`}</Section>
        </Box>
      </Box>
    </Box>
  </Box>
)

const Section = ({ title, children }: { title: string; children: string }) => (
  <Box border={(t) => `1px solid ${t.design.Color.Neutral[950]}`} display="flex" flexDirection="column" flex="1 1 0">
    <InvertTheme>
      <Typography
        color="text.primary"
        variant="headingXsBold"
        sx={(t) => ({ backgroundColor: t.design.Layer[1].Fill, padding: Spacing.xs })}
      >
        {title}
      </Typography>
    </InvertTheme>
    <Typography variant="bodyMBold" color="text.secondary" padding={Spacing.sm} flexGrow={1} alignContent="center">
      {children}
    </Typography>
  </Box>
)
