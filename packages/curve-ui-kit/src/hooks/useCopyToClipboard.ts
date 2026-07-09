import { useCallback } from 'react'
import { ADDRESS_REGEX } from '@primitives/address.utils'
import { t } from '@ui-kit/lib/i18n'
import { showToast } from '@ui-kit/widgets/Toast/toast.util'

const getTitle = (copyText: string, title: string | undefined) =>
  title ?? t`${ADDRESS_REGEX.test(copyText) ? `Address` : `Value`} has been copied to clipboard`

export const useCopyToClipboard = ({
  copyText,
  confirmationText,
  testId = 'copy-confirmation' as const,
}: {
  copyText: string | undefined
  confirmationText?: string
  testId?: string
}) =>
  useCallback(() => {
    if (!copyText) return showToast({ title: t`Nothing to copy`, severity: 'warning', testId })

    return void (
      navigator.clipboard?.writeText(copyText).then(
        () => showToast({ message: copyText, severity: 'info', title: getTitle(copyText, confirmationText), testId }),
        e => showToast({ title: (e as Error).message, severity: 'error', testId }),
      ) ?? showToast({ title: t`Clipboard not available`, severity: 'warning', testId })
    )
  }, [copyText, confirmationText, testId])
