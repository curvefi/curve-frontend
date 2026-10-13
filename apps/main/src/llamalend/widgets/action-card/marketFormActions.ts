import type { useControllerDelegationAction } from '@/llamalend/widgets/action-card/hooks/useControllerDelegationAction'
import type { useLowSolvencyAction } from '@/llamalend/widgets/action-card/hooks/useLowSolvencyAction'
import { notFalsy } from '@primitives/objects.utils'
import {
  combineFormActions,
  type FieldValues,
  type FormActionModalProps,
  type UseFormHandleSubmit,
} from '@ui/features/forms'

type LowSolvencyAction = ReturnType<typeof useLowSolvencyAction>
type DelegationAction = ReturnType<typeof useControllerDelegationAction>
type DelegationModalProps = FormActionModalProps & { gas: DelegationAction['gas'] }

/** Outputs are only defined when the related action was given */
type OutputOf<Action, Output> = Action extends undefined ? undefined : Output

/**
 * Runs the market form actions in a fixed order (low solvency, then controller delegation) before `onConfirmed`.
 * Each action is optional, pass only the ones the form needs.
 */
export function marketFormActions<
  T extends FieldValues,
  S extends LowSolvencyAction | undefined = undefined,
  D extends DelegationAction | undefined = undefined,
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
  const { modals, ...formActions } = combineFormActions({
    handleSubmit,
    actions: notFalsy<LowSolvencyAction | DelegationAction>(lowSolvency, delegation),
    onConfirmed,
  })
  return {
    ...formActions,
    solvencyModal: (lowSolvency && modals.lowSolvency) as OutputOf<S, FormActionModalProps>,
    solvencyAlert: lowSolvency?.disabledAlert as OutputOf<S, LowSolvencyAction['disabledAlert']>,
    delegationModal: (delegation && { ...modals.controllerDelegation, gas: delegation.gas }) as OutputOf<
      D,
      DelegationModalProps
    >,
  }
}
