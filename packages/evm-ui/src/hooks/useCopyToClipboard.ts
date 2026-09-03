import { useCallback } from 'react'
import { t } from '@evm-ui/lib/i18n'
import { copyToClipboard } from '@evm-ui/utils'
import { showToast } from '@evm-ui/widgets/Toast/toast.util'
import { isAddress } from '@primitives/address.utils'

const getTitle = (copyText: string, title: string | undefined) =>
  title ?? t`${isAddress(copyText) ? `Address` : `Value`} has been copied to clipboard`

type CopyToClipboardWithToastOptions = {
  copyText: string | undefined
  confirmationText?: string
  confirmationMessage?: string
  failureText?: string
  testId?: string
}

export const copyToClipboardWithToast = async ({
  copyText,
  confirmationText,
  confirmationMessage,
  failureText = t`Failed to copy to clipboard`,
  testId = 'copy-confirmation',
}: CopyToClipboardWithToastOptions) => {
  if (!copyText) return showToast({ title: t`Nothing to copy`, severity: 'warning', testId })

  const copied = await copyToClipboard(copyText)
  showToast(
    copied
      ? {
          message: confirmationMessage ?? copyText,
          severity: 'info',
          title: getTitle(copyText, confirmationText),
          testId,
        }
      : { severity: 'error', title: failureText, testId },
  )
}

export const useCopyToClipboard = ({
  copyText,
  confirmationText,
  confirmationMessage,
  testId,
}: {
  copyText: string | undefined
  confirmationText?: string
  confirmationMessage?: string
  testId?: string
}) =>
  useCallback(() => {
    void copyToClipboardWithToast({ copyText, confirmationText, confirmationMessage, testId })
  }, [copyText, confirmationText, confirmationMessage, testId])
