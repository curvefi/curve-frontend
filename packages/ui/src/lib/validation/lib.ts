import { noop } from 'lodash'
import { create, only, type Suite } from 'vest'
import { FieldsOf, ValidationKey } from '@ui/lib/validation/types'

/**
 * This is using `any` because `vest` will try to match every single field,
 * and some validators don't validate everything (we pass chainId, marketId, userAddress plus variables).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValidationSuite = Suite<any, any> | Suite<never, any>

export const validate = <D extends object, S extends ValidationSuite>(
  suite: S,
  data: FieldsOf<D>,
  fields?: ValidationKey<D>[],
) => {
  suite.reset() // reset the validation state so all fields get revalidated even if they didn't change
  return suite.run(data, fields).getErrors()
}

export function assertValidity<D extends object, S extends ValidationSuite>(
  suite: S,
  data: FieldsOf<D>,
  fields?: ValidationKey<D>[],
): D {
  const entries = Object.entries(validate(suite, data, fields))
  if (entries.length > 0) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- Existing violation before enabling this rule.
    throw new Error(`Validation failed: ${entries.map(([field, error]) => `${field}: ${error}`).join(', ')}`)
  }
  return data as D
}

export const createValidationSuite = <T extends object, TGroupName extends string = string>(
  validationGroup: (data: T) => void,
): Suite<ValidationKey<T>, TGroupName> =>
  create<ValidationKey<T>, TGroupName>((data: T, fieldsList?: ValidationKey<T>[]) => {
    // Empty selections validate all fields, including in legacy form resolvers.
    only(fieldsList?.length ? [...fieldsList, 'root'] : fieldsList)
    validationGroup(data)
  })

export const EmptyValidationSuite = createValidationSuite(noop)
