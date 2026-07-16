import { useCallback } from 'react'
import { ADDRESS_REGEX } from '@primitives/address.utils'
import { t } from '@ui-kit/lib/i18n'
import { copyToClipboard } from '@ui-kit/utils'
import { showToast } from '@ui-kit/widgets/Toast/toast.util'

const getTitle = (copyText: string, title: string | undefined) =>
  title ?? t`${ADDRESS_REGEX.test(copyText) ? `Address` : `Value`} has been copied to clipboard`

type CopyToClipboardWithToastOptions = {
  copyText: string | undefined
  confirmationText?: string
  failureText?: string
  testId?: string
}

export const copyToClipboardWithToast = async ({
  copyText,
  confirmationText,
  failureText = t`Failed to copy to clipboard`,
  testId = 'copy-confirmation',
}: CopyToClipboardWithToastOptions) => {
  if (!copyText) return showToast({ title: t`Nothing to copy`, severity: 'warning', testId })

  const copied = await copyToClipboard(copyText)
  showToast(
    copied
      ? { message: copyText, severity: 'info', title: getTitle(copyText, confirmationText), testId }
      : { severity: 'error', title: failureText, testId },
  )
}

export const useCopyToClipboard = ({
  copyText,
  confirmationText,
  testId,
}: {
  copyText: string | undefined
  confirmationText?: string
  testId?: string
}) =>
  useCallback(() => {
    void copyToClipboardWithToast({ copyText, confirmationText, testId })
  }, [copyText, confirmationText, testId])
