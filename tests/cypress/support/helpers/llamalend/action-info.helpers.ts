import { notFalsy } from '@curvefi/prices-api/objects.util'
import { LOAD_TIMEOUT } from '@cy/support/ui'

export const getActionValue = (name: string, field?: 'previous') =>
  cy
    .get(`[data-testid="${notFalsy(name, field, 'value').join('-')}"]`, LOAD_TIMEOUT)
    .invoke(LOAD_TIMEOUT, 'attr', 'data-value')
