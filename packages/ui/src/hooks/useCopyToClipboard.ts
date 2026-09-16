import { useCallback } from 'react'
import { ADDRESS_HEX_PATTERN } from '@primitives/address.utils'
import { showToast } from '@ui/features/toast/Toast/toast.util'
import { copyToClipboard } from '@ui/lib/clipboard'
import { t } from '@ui/lib/i18n'

const getTitle = (copyText: string, title: string | undefined) =>
  title ?? t`${ADDRESS_HEX_PATTERN.test(copyText) ? `Address` : `Value`} has been copied to clipboard`

type CopyToClipboardWithToastOptions = {
  copyText: string | undefined
  format?: (text: string) => string
  confirmationText?: string
  confirmationMessage?: string
  failureText?: string
  testId?: string
}

export const copyToClipboardWithToast = async ({
  copyText,
  format,
  confirmationText,
  confirmationMessage,
  failureText = t`Failed to copy to clipboard`,
  testId = 'copy-confirmation',
}: CopyToClipboardWithToastOptions) => {
  if (!copyText) return showToast({ title: t`Nothing to copy`, severity: 'warning', testId })

  const formattedText = format ? format(copyText) : copyText
  const copied = await copyToClipboard(formattedText)
  showToast(
    copied
      ? {
          message: confirmationMessage ?? formattedText,
          severity: 'info',
          title: getTitle(formattedText, confirmationText),
          testId,
        }
      : { severity: 'error', title: failureText, testId },
  )
}

export const useCopyToClipboard = ({
  copyText,
  format,
  confirmationText,
  confirmationMessage,
  testId,
}: {
  copyText: string | undefined
  format?: (text: string) => string
  confirmationText?: string
  confirmationMessage?: string
  testId?: string
}) =>
  useCallback(() => {
    void copyToClipboardWithToast({ copyText, format, confirmationText, confirmationMessage, testId })
  }, [copyText, format, confirmationText, confirmationMessage, testId])
