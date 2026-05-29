import lodash from 'lodash'
import { type DeepKeys } from '@tanstack/table-core'

// eslint-disable-next-line @typescript-eslint/unbound-method -- Existing violation before enabling this rule.
const { get, sortBy, sortedUniq } = lodash
/**
 * Get all unique string values from a field in an array of objects and sort them alphabetically.
 * TODO: validate T[K] is string with typescript. DeepKeys makes it hard to do this.
 */
export const getUniqueSortedStrings = <T, K extends DeepKeys<T>>(data: T[], field: K) => {
  const values = data.map(d => get(d, field) as string)
  return sortedUniq(sortBy(values, val => val.toLowerCase()))
}
