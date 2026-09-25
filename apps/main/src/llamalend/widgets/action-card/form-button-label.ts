import { type Nullish, notFalsy } from '@primitives/objects.utils'
import { joinButtonText } from '@primitives/string.utils'
import { type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

export const getFormButtonLabel = ({
  isControllerApproved,
  isApproved,
  labels,
}: {
  isControllerApproved?: QueryProp<boolean>
  isApproved?: QueryProp<boolean>
  labels: (string | false | 0 | Nullish)[]
}) =>
  isControllerApproved?.data === false
    ? t`Approve delegation`
    : joinButtonText(...notFalsy(isApproved?.data === false && t`Approve`, ...labels))
