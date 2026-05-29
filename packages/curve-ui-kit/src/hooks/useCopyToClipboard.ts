import { useCallback } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { showToast } from '@ui-kit/widgets/Toast/toast.util'

const DEFAULT_TEST_ID = 'copy-confirmation' as const

export const useCopyToClipboard = ({
  copyText,
  confirmationText,
  testId = DEFAULT_TEST_ID,
}: {
  copyText: string
  confirmationText: string
  testId?: string
}) =>
  useCallback(() => {
    console.info(`Copying to clipboard: ${copyText}`)
    return (
      navigator.clipboard?.writeText(copyText).then(
        () => showToast({ message: copyText, severity: 'info', title: confirmationText, testId }),
        e => showToast({ title: e.message, severity: 'error', testId }),
      ) ?? showToast({ title: t`Clipboard not available`, severity: 'warning', testId })
    )
  }, [copyText, confirmationText, testId])
