import { RCScrvUSDLogoSM } from 'ui/src/images'
import { CrvUsdStaking } from '@/loan/components/PageCrvUsdStaking'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Box } from '@ui/Box'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { Spacing as PrimitiveSpacing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, MaxWidth } = SizesAndSpaces

export const Page = () => (
  <Stack
    data-testid="scrvusd-page"
    direction="column"
    margin={'0 auto'}
    marginBottom={PrimitiveSpacing[600]}
    gap={PrimitiveSpacing[600]}
    alignItems="center"
    sx={{
      maxWidth: `calc(${MaxWidth.legacyActionCard} + ${PrimitiveSpacing[200]} + ${MaxWidth.section})`, // action card + gap + section
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      alignSelf="flex-start"
      gap={Spacing.sm}
      paddingInline={Spacing.sm}
      paddingBlock={Spacing.md}
    >
      <img height={55} src={RCScrvUSDLogoSM} alt="crvUSD logo" />
      <Box flex flexColumn>
        <Typography variant="headingMBold">{t`Savings crvUSD`}</Typography>
        <Typography variant="bodySRegular">{t`Let your idle crvUSD do more for you.`}</Typography>
      </Box>
    </Stack>
    <CrvUsdStaking params={useParams<NetworkUrlParams>()} />
  </Stack>
)
