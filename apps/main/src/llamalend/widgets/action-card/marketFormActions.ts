import type { useControllerDelegationAction } from '@/llamalend/widgets/action-card/hooks/useControllerDelegationAction'
import type { useLowSolvencyAction } from '@/llamalend/widgets/action-card/hooks/useLowSolvencyAction'
import { maybe } from '@primitives/objects.utils'
import { combineFormActions, type FieldValues, type UseFormHandleSubmit } from '@ui/features/forms'

/**
 * Runs the market form actions in a fixed order (low solvency, then controller delegation) before `onConfirmed`.
 * Each action is optional, pass only the ones the form needs.
 */
export function marketFormActions<
  T extends FieldValues,
  S extends ReturnType<typeof useLowSolvencyAction> | undefined = undefined,
  D extends ReturnType<typeof useControllerDelegationAction> | undefined = undefined,
>({
  handleSubmit,
  lowSolvency,
  delegation,
  onConfirmed,
}: {
  handleSubmit: UseFormHandleSubmit<T>
  lowSolvency?: S
  delegation?: D
  onConfirmed: (values: T) => unknown
}) {
  const { getModalProps, ...formActions } = combineFormActions({
    handleSubmit,
    actions: [lowSolvency, delegation],
    onConfirmed,
  })
  return {
    ...formActions,
    solvencyModal: maybe(lowSolvency as S, getModalProps),
    solvencyAlert: maybe(lowSolvency as S, ({ disabledAlert }) => disabledAlert),
    delegationModal: maybe(delegation as D, action => ({ ...getModalProps(action), gas: action.gas })),
  }
}
