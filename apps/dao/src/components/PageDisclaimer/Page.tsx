import type { NextPage } from 'next'
import { useEffect } from 'react'
import { t } from '@lingui/macro'

import Stack from '@mui/material/Stack'

import DocumentHead from '@/layout/DocumentHead'
import { scrollToTop } from '@/utils'

import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'
import { Disclaimer } from 'curve-ui-kit/src/widgets/Disclaimer'

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
