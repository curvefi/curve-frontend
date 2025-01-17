import type { NextPage } from 'next'
import { useEffect } from 'react'
import { t } from '@lingui/macro'

import Stack from '@mui/material/Stack'

import DocumentHead from '@loan/layout/DocumentHead'
import { scrollToTop } from '@loan/utils/helpers'

import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'

const { Spacing } = SizesAndSpaces

const Page: NextPage = () => {
  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={t`Risk Disclaimer`} />

      <Stack
        alignItems="center"
        gap={Spacing.xl}
        sx={{
          marginInline: 'auto',
          marginBlockStart: Spacing.xl,
          marginBlockEnd: Spacing.xxl,
        }}
      >
        <Disclaimer />
      </Stack>
    </>
  )
}

export default Page
