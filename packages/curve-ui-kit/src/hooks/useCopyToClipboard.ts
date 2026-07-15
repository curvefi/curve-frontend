import { useCallback } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { copyToClipboard } from '@ui-kit/utils'
import { showToast } from '@ui-kit/widgets/Toast/toast.util'

const DEFAULT_TEST_ID = 'copy-confirmation' as const

type CopyToClipboardWithToastOptions = {
  copyText: string
  confirmationText: string
  failureText?: string
  testId?: string
}

export const copyToClipboardWithToast = async ({
  copyText,
  confirmationText,
  failureText = t`Failed to copy to clipboard`,
  testId = DEFAULT_TEST_ID,
}: CopyToClipboardWithToastOptions) => {
  const copied = await copyToClipboard(copyText)
  showToast(
    copied
      ? { message: copyText, severity: 'info', title: confirmationText, testId }
      : { severity: 'error', title: failureText, testId },
  )
}

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
    void copyToClipboardWithToast({ copyText, confirmationText, testId })
  }, [copyText, confirmationText, testId])
