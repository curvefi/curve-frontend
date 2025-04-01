'use client'
import Image from 'next/image'
import { RCScrvUSDLogoSM } from 'ui/src/images'
import CrvUsdStaking from '@/loan/components/PageCrvUsdStaking'
import usePageOnMount from '@/loan/hooks/usePageOnMount'
import Settings from '@/loan/layout/Settings'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'
import { Spacing as PrimitiveSpacing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, MaxWidth } = SizesAndSpaces

const Page = (params: NetworkUrlParams) => {
  usePageOnMount() // handles connecting wallet
  return (
    <>
      <Stack
        direction="column"
        margin={'0 auto'}
        marginBottom={PrimitiveSpacing[600]}
        gap={PrimitiveSpacing[600]}
        alignItems="center"
        sx={{
          maxWidth: `calc(${MaxWidth.actionCard} + ${PrimitiveSpacing[200]} + ${MaxWidth.section})`, // action card + gap + section
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
          <Image height={55} src={RCScrvUSDLogoSM} alt="crvUSD logo" />
          <Box flex flexColumn>
            <Typography variant="headingMBold">{t`Savings crvUSD`}</Typography>
            <Typography variant="bodySRegular">{t`Let your idle crvUSD do more for you.`}</Typography>
          </Box>
        </Stack>
        <CrvUsdStaking params={params} />
      </Stack>
      <Settings showScrollButton />
    </>
  )
}

export default Page
