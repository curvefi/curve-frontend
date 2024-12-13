import Box from '@mui/material/Box'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import LlamaSunglasses from '../../../public/images/llama-sunglasses.png'
import Image from 'next/image'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import Typography from '@mui/material/Typography'
import { InvertTheme } from '@ui-kit/shared/ui/ThemeProvider'

const Img = styled(Image)`
  flex-shrink: 1;
  height: 276px;
`

const { MaxWidth, Sizing, Spacing } = SizesAndSpaces

// note: The design seems to be using non-responsive values, this is not consistent!
const { sm, md } = Spacing

export const LendTableTitle = () => (
  <Box sx={(t) => ({ backgroundColor: t.design.Layer[3].Fill, boxShadow: '0px 4px 4px -2px #2A334524' })}>
    <Box maxWidth={MaxWidth.md} paddingBlock={Spacing.lg} display="flex" gap={sm} marginInline="auto">
      <Img src={LlamaSunglasses} alt="Llama with sunglasses" />
      <Box display="flex" flexDirection="column" gap={sm} flexGrow={1}>
        <InvertTheme>
          <Box
            padding={Spacing.lg}
            gap={Sizing.sm}
            sx={(t) => ({ backgroundColor: t.design.Layer.Highlight.Fill })}
            flex="1 1 50%"
          >
            <Typography color="text.primary" variant="headingXxl">{t`LLAMALEND`}</Typography>
            <Typography
              color="text.secondary"
              variant="bodyMBold"
            >{t`Stress - Free Borrowing in volatile markets`}</Typography>
          </Box>
        </InvertTheme>
        <Box display="flex" flexDirection="row" gap={md} flex="1 1 50%">
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
    <Box padding={Spacing.sm} flexGrow={1} alignContent="center">
      <Typography variant="bodyMBold" color="text.secondary">
        {children}
      </Typography>
    </Box>
  </Box>
)
