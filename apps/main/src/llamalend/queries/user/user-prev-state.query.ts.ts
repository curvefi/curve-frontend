import { useUserState } from '@/llamalend/queries/user'
import { mapQuery, q } from '@ui-kit/types/util'

/** Helper hook to get the current debt and collateral from user state for the action info list
 * @todo: rename the hook consistent with the renaming of the action info props: "prevCollateral" -> "collateral" and "collateral" -> expectedCollateral
 */
export const usePrevUserState = (params: Parameters<typeof useUserState>[0], enabled?: boolean) => {
  const userState = q(useUserState(params, enabled))
  return {
    prevDebt: mapQuery(userState, ({ debt }) => debt),
    prevCollateral: mapQuery(userState, ({ collateral }) => collateral),
  }
}
