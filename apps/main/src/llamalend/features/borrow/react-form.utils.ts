import type { SetValueConfig } from 'react-hook-form'

/** Options to pass to react-hook-form's setValue to trigger validation, dirty and touch states. */
export const setValueOptions: SetValueConfig = { shouldValidate: true, shouldDirty: true, shouldTouch: true }
