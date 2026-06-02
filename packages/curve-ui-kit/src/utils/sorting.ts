import { get, sortBy, sortedUniq } from 'lodash'
import { type DeepKeys } from '@tanstack/table-core'

/**
 * Get all unique string values from a field in an array of objects and sort them alphabetically.
 * TODO: validate T[K] is string with typescript. DeepKeys makes it hard to do this.
 */
export const getUniqueSortedStrings = <T, K extends DeepKeys<T>>(data: T[], field: K) => {
  const values = data.map(d => get(d, field) as string)
  return sortedUniq(sortBy(values, val => val.toLowerCase()))
}
