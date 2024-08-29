import { type ValidatedData } from '@/entities/validation/types'
import { create, enforce, only, type Suite } from 'vest'
import { extendEnforce } from '@/entities/validation/enforce-extension'

extendEnforce(enforce)

export function checkValidity<D extends object, S extends Suite<any, any>>(
  suite: S,
  data: D,
  fields?: Extract<keyof D, string>[]
): boolean {
  const result = suite(data, fields)
  return !result.hasErrors()
}

export function assertValidity<D extends object, S extends Suite<any, any>>(
  suite: S,
  data: D,
  fields?: Extract<keyof D, string>[]
): ValidatedData<D> {
  const result = suite(data, fields)
  if (result.hasErrors()) {
    const errors = result.getErrors()
    const errorMessages = Object.values(errors).flat()
    throw new Error('Validation failed: ' + errorMessages.join(', '))
  }
  return data as ValidatedData<D>
}

export function createValidationSuite<T extends object>(validationGroup: (data: T) => void) {
  return create((data: T, fields?: Extract<keyof T, string>[]) => {
    const fieldList = fields && fields.length > 0 ? fields : Object.keys(data)
    only(fieldList)
    validationGroup(data)
  })
}
