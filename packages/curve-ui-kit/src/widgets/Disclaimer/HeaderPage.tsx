import { useMemo, useEffect } from 'react'
import { useRouter } from 'next/router'
import { t } from '@lingui/macro'

import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import WestIcon from '@mui/icons-material/West'

import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'
import { RiskDisclaimersIcon } from 'curve-ui-kit/src/shared/icons/RiskDisclaimersIcon'

const { Spacing, Sizing, MaxWidth } = SizesAndSpaces

export const HeaderPage = () => {
  const router = useRouter()

  // Check if window.history has previous entries from our app.
  // TODO: this doesn't work properly yet, but also isn't used yet.
  const canGoBack = useMemo(() => window.history.length > 1 && document.referrer.includes(window.location.host), [])

  return (
    <Stack
      direction="row"
      sx={{
        backgroundColor: (t) => t.design.Layer[3].Fill,
        width: '100%',
        height: Sizing.xxl,
      }}
    >
      <Stack
        direction="row"
        flexGrow={1}
        alignItems="center"
        gap={Spacing.sm}
        sx={{
          paddingBlock: Spacing.sm,
          paddingInline: Spacing.md,
          maxWidth: MaxWidth.lg,
        }}
      >
        <IconButton size="small" disabled={!canGoBack || router.asPath === '/'} onClick={() => router.back()}>
          <WestIcon />
        </IconButton>

        <RiskDisclaimersIcon sx={{ height: '100%', width: 'auto' }} />

        <Typography variant="headingMBold">{t`Risk Disclaimers`}</Typography>
      </Stack>
    </Stack>
  )
}
