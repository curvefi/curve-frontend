import Stack from '@mui/material/Stack'
import { t } from '@lingui/macro'
import React, { ReactNode } from 'react'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import Typography from '@mui/material/Typography'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'

const { Spacing, IconSize } = SizesAndSpaces

const Badge = ({ children, compact }: { children: ReactNode; compact?: boolean }) => (
  <Typography
    variant="buttonXs"
    sx={(t) => ({
      border: `1px solid ${t.design.Layer[1].Outline}`,
      alignContent: 'center',
      ...(compact
        ? {
            paddingInline: '1px',
            height: 22, // not ideal to hardcode, but if left out the badge becomes 24px somehow
          }
        : {
            paddingInline: '6px', // hardcoded from figma
            paddingBlock: Spacing.xxs, // xs in figma but content is 12px there instead of 14px
          }),
    })}
  >
    {children}
  </Typography>
)

export const PoolBadges = ({ blockchainId }: { blockchainId: string }) => (
  <Stack direction="row" gap={Spacing.sm}>
    <Badge compact>
      <ChainIcon blockchainId={blockchainId} size="md" />
    </Badge>
    <Badge>{t`Pool`}</Badge>
  </Stack>
)
