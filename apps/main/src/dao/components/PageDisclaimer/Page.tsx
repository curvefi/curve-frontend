import type { NextPage } from 'next'
import { useEffect } from 'react'
import { t } from '@ui-kit/lib/i18n'

import Stack from '@mui/material/Stack'

import DocumentHead from '@/dao/layout/DocumentHead'
import { scrollToTop } from '@/dao/utils'

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
