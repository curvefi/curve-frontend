import { useCallback } from 'react'
import { ADDRESS_REGEX } from '@primitives/address.utils'
import { t } from '@ui-kit/lib/i18n'
import { showToast } from '@ui-kit/widgets/Toast/toast.util'

const DEFAULT_TEST_ID = 'copy-confirmation' as const
const DEFAULT_CONFIRMATION_TEXT = t`Value has been copied to clipboard`
const DEFAULT_ADDRESS_CONFIRMATION_TEXT = t`Address has been copied to clipboard`

export const useCopyToClipboard = ({
  copyText = '<empty text>',
  confirmationText,
  testId = DEFAULT_TEST_ID,
}: {
  copyText: string | undefined
  confirmationText?: string
  testId?: string
}) =>
  useCallback(() => {
    console.info(`Copying to clipboard: ${copyText}`)
    const title =
      confirmationText ?? (ADDRESS_REGEX.test(copyText) ? DEFAULT_ADDRESS_CONFIRMATION_TEXT : DEFAULT_CONFIRMATION_TEXT)
    return void (
      navigator.clipboard?.writeText(copyText).then(
        () => showToast({ message: copyText, severity: 'info', title, testId }),
        e => showToast({ title: (e as Error).message, severity: 'error', testId }),
      ) ?? showToast({ title: t`Clipboard not available`, severity: 'warning', testId })
    )
  }, [copyText, confirmationText, testId])
